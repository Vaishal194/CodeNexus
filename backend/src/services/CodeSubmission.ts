
import {pool} from "../database.js"; // Adjust to your actual database pool path
import executeCode from "./ExecutionService.js";
import { ExecutionResult } from "../interfaces/ExecutionResult.js";

type CodeSubmissionStatus =
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "TIME_LIMIT_EXCEEDED"
    | "COMPILATION_ERROR"
    | "RUNTIME_ERROR";

function mapStatus(status: ExecutionResult["status"]): CodeSubmissionStatus {
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
    const validation = await pool.query(
        `SELECT
            ta.id AS attempt_id,
            ta.status AS attempt_status,
            tq.id AS test_question_id,
            tq.problem_id,
            tq.marks
         FROM test_attempts ta
         JOIN test_questions tq
           ON tq.test_id = ta.test_id
         WHERE ta.id = $1
           AND tq.id = $2
           AND tq.question_type = 'coding'`,
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

    // 2. Create a submission record.
    const inserted = await pool.query(
        `INSERT INTO code_submissions
            (attempt_id, test_question_id, language,
             source_code, status)
         VALUES ($1, $2, $3, $4, 'RUNNING')
         RETURNING id`,
        [attemptId, testQuestionId, language, code]
    );

    const submissionId = inserted.rows[0].id;

    try {
        // 3. Execute the code against the problem's test cases.
        const result: ExecutionResult = await executeCode(
            Number(question.problem_id),
            language,
            code
        );

        // 4. Read the runner's test-case summary.
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
                throw new Error("Invalid test-case summary");
            }
        }

        // Award proportional marks for coding questions.
        // Accepted solutions receive full marks.
        const status = mapStatus(result.status);

        const marksAwarded =
            status === "ACCEPTED"
                ? Number(question.marks)
                : total > 0
                    ? Number(
                        (
                            Number(question.marks) *
                            passed / total
                        ).toFixed(2)
                    )
                    : 0;

        // 5. Save the final execution result.
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
