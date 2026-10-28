import { pool } from "../database.js";
import executeCode from "./ExecutionService.js";
import type { ExecutionResult } from "../interfaces/ExecutionResult.js";

type CodeSubmissionStatus =
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "TIME_LIMIT_EXCEEDED"
    | "COMPILATION_ERROR"
    | "RUNTIME_ERROR";

function mapStatus(
    status: ExecutionResult["status"]
): CodeSubmissionStatus {
    switch (status) {
        case "Accepted":
            return "ACCEPTED";

        case "Wrong Answer":
            return "WRONG_ANSWER";

        case "Time Limit Exceeded":
            return "TIME_LIMIT_EXCEEDED";

        case "Compilation Error":
            return "COMPILATION_ERROR";

        case "Memory Limited Exceeded":
        case "Runtime Error":
            return "RUNTIME_ERROR";
    }
}

export async function submitCode(
    attemptId: number,
    testQuestionId: number,
    language: string,
    code: string
) {
    let submissionId: number | string;

    let problemId: number;
    let questionMarks: number;

    // 1. Lock the attempt and create the submission atomically.
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const validation = await client.query(
            `SELECT
                ta.id AS attempt_id,
                ta.status AS attempt_status,
                tq.id AS test_question_id,
                tq.problem_id,
                tq.marks
             FROM test_attempts AS ta
             JOIN test_questions AS tq
               ON tq.test_id = ta.test_id
             WHERE ta.id = $1
               AND tq.id = $2
               AND LOWER(tq.question_type) = 'coding'
             FOR UPDATE OF ta`,
            [attemptId, testQuestionId]
        );

        if (validation.rowCount === 0) {
            throw new Error(
                "Attempt or coding question not found"
            );
        }

        const question = validation.rows[0];

        if (question.attempt_status !== "IN_PROGRESS") {
            throw new Error("Attempt is not active");
        }

        problemId = Number(question.problem_id);
        questionMarks = Number(question.marks);

        const inserted = await client.query(
            `INSERT INTO code_submissions
                (attempt_id, test_question_id, language,
                 source_code, status)
             VALUES ($1, $2, $3, $4, 'RUNNING')
             RETURNING id`,
            [attemptId, testQuestionId, language, code]
        );

        submissionId = inserted.rows[0].id;

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }

    // 2. Execute only after the transaction and row lock are released.
    try {
        const result: ExecutionResult = await executeCode(
            problemId,
            language,
            code
        );

        let passed = 0;
        let total = 0;

        if (result.output) {
            const summary = JSON.parse(result.output);

            passed = Number(summary.passed);
            total = Number(summary.total);

            if (
                !Number.isInteger(passed) ||
                !Number.isInteger(total) ||
                total <= 0 ||
                passed < 0 ||
                passed > total
            ) {
                throw new Error(
                    "Invalid test-case summary"
                );
            }
        }

        const status = mapStatus(result.status);

        const marksAwarded =
            status === "ACCEPTED"
                ? questionMarks
                : total > 0
                    ? Number(
                        (
                            questionMarks * passed / total
                        ).toFixed(2)
                    )
                    : 0;

        // 3. Save the final execution result.
        const updated = await pool.query(
            `UPDATE code_submissions
             SET status = $1,
                 passed_test_cases = $2,
                 total_test_cases = $3,
                 marks_awarded = $4
             WHERE id = $5
             RETURNING id, attempt_id, test_question_id,
                       language, status, passed_test_cases,
                       total_test_cases, marks_awarded,
                       submitted_at`,
            [
                status,
                passed,
                total,
                marksAwarded,
                submissionId
            ]
        );

        return {
            submission: updated.rows[0],
            error: result.error ?? null
        };
    } catch (error) {
        // Mark failed execution attempts so they do not remain RUNNING.
        await pool.query(
            `UPDATE code_submissions
             SET status = 'RUNTIME_ERROR',
                 marks_awarded = 0
             WHERE id = $1`,
            [submissionId]
        );

        throw error;
    }
}
