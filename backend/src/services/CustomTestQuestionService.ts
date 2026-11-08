import { PoolClient } from "pg";
import { pool } from "../database.js";
import { customTestMcqPayload, customTestCodingPayload } from "../interfaces/CustomTestQuestion.js";

export class CustomTestQuestionError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.name = "CustomTestQuestionError";
        this.statusCode = statusCode;
    }
}

function positiveInt(value: unknown): number | null {
    const numeric = Number(value);
    return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

function toText(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string");
}

async function assertOwnership(
    client: PoolClient,
    testId: number,
    studentId: string
) {
    const result = await client.query(
        `SELECT id
         FROM tests
         WHERE id = $1
           AND created_by = $2
           AND test_type = 'custom'
         FOR SHARE`,
        [testId, studentId]
    );

    if (result.rowCount === 0) {
        throw new CustomTestQuestionError(
            "You do not have permission to edit this test",
            403
        );
    }
}

async function nextSequenceNumber(client: PoolClient, testId: number) {
    const result = await client.query(
        `SELECT COALESCE(MAX(sequence_number), 0) + 1 AS next_sequence
         FROM test_questions
         WHERE test_id = $1`,
        [testId]
    );

    return Number(result.rows[0].next_sequence);
}

async function recalculateTotalMarks(client: PoolClient, testId: number) {
    await client.query(
        `UPDATE tests
         SET total_marks = COALESCE(
                 (SELECT SUM(marks) FROM test_questions WHERE test_id = $1),
                 0
             ),
             updated_at = NOW()
         WHERE id = $1`,
        [testId]
    );
}

export async function addCustomTestMcq(
    testId: number,
    studentId: string,
    data: customTestMcqPayload
) {
    const question = toText(data.question);
    const options = toStringArray(data.options).map((option) => option.trim());
    const correctOption = Number(data.correct_option);
    const marks = positiveInt(data.marks);

    if (!question) {
        throw new CustomTestQuestionError("Question statement is required");
    }

    if (options.length < 2 || options.some((option) => !option)) {
        throw new CustomTestQuestionError(
            "At least two non-empty options are required"
        );
    }

    if (
        !Number.isInteger(correctOption) ||
        correctOption < 0 ||
        correctOption >= options.length
    ) {
        throw new CustomTestQuestionError("A valid correct option is required");
    }

    if (marks === null) {
        throw new CustomTestQuestionError(
            "Marks must be a positive whole number"
        );
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await assertOwnership(client, testId, studentId);

        const mcq = await client.query(
            `INSERT INTO mcq_questions (question, options, correct_option, explanation)
             VALUES ($1, $2, $3, $4)
             RETURNING id, question, options, correct_option, explanation`,
            [
                question,
                JSON.stringify(options),
                correctOption,
                typeof data.explanation === "string" ? data.explanation.trim() : "",
            ]
        );

        const sequenceNumber = await nextSequenceNumber(client, testId);

        const testQuestion = await client.query(
            `INSERT INTO test_questions
                (test_id, question_type, mcq_id, marks, sequence_number)
             VALUES ($1, 'mcq', $2, $3, $4)
             RETURNING *`,
            [testId, mcq.rows[0].id, marks, sequenceNumber]
        );

        await recalculateTotalMarks(client, testId);

        await client.query("COMMIT");

        return {
            mcq: mcq.rows[0],
            test_question: testQuestion.rows[0],
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function addCustomTestCoding(
    testId: number,
    studentId: string,
    data: customTestCodingPayload
) {
    const title = toText(data.title);
    const description = toText(data.description);
    const difficulty = toText(data.difficulty);
    const languages = toStringArray(data.supported_languages);
    const marks = positiveInt(data.marks);
    const testCases = Array.isArray(data.test_cases) ? data.test_cases : [];

    if (!title) {
        throw new CustomTestQuestionError("Problem title is required");
    }

    if (!description) {
        throw new CustomTestQuestionError("Problem description is required");
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
        throw new CustomTestQuestionError("A valid difficulty is required");
    }

    if (languages.length === 0) {
        throw new CustomTestQuestionError(
            "Select at least one supported runtime"
        );
    }

    if (marks === null) {
        throw new CustomTestQuestionError(
            "Marks must be a positive whole number"
        );
    }

    if (testCases.length === 0) {
        throw new CustomTestQuestionError("At least one test case is required");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await assertOwnership(client, testId, studentId);

        const problem = await client.query(
            `INSERT INTO problems
                (title, description, difficulty, supported_languages,
                 input_format, output_format, constraints, source_test_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, title, description, difficulty,
                       supported_languages, input_format, output_format,
                       constraints, source_test_id`,
            [
                title,
                description,
                difficulty,
                languages,
                typeof data.input === "string" ? data.input : "",
                typeof data.output === "string" ? data.output : "",
                toStringArray(data.constraints),
                testId,
            ]
        );

        const problemId = problem.rows[0].id;
        const sequenceNumber = await nextSequenceNumber(client, testId);

        const testQuestion = await client.query(
            `INSERT INTO test_questions
                (test_id, question_type, problem_id, marks, sequence_number)
             VALUES ($1, 'coding', $2, $3, $4)
             RETURNING *`,
            [testId, problemId, marks, sequenceNumber]
        );

        const savedCases = [];

        for (const [index, testCase] of testCases.entries()) {
            const saved = await client.query(
                `INSERT INTO test_cases
                    (problem_id, input, expected_output, is_hidden, sequence_number)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [
                    problemId,
                    typeof testCase?.input === "string" ? testCase.input : "",
                    typeof testCase?.expected_output === "string"
                        ? testCase.expected_output
                        : "",
                    Boolean(testCase?.is_hidden),
                    Number.isInteger(Number(testCase?.sequence_number))
                        ? Number(testCase.sequence_number)
                        : index + 1,
                ]
            );

            savedCases.push(saved.rows[0]);
        }

        await recalculateTotalMarks(client, testId);

        await client.query("COMMIT");

        return {
            problem: problem.rows[0],
            test_question: testQuestion.rows[0],
            test_cases: savedCases,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function linkProblemToCustomTest(
    testId: number,
    studentId: string,
    problemId: number,
    marks: number
) {
    if (!Number.isInteger(problemId) || problemId <= 0) {
        throw new CustomTestQuestionError("A valid problem is required");
    }

    if (!Number.isInteger(marks) || marks <= 0) {
        throw new CustomTestQuestionError(
            "Marks must be a positive whole number"
        );
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await assertOwnership(client, testId, studentId);

        const problem = await client.query(
            `SELECT id
             FROM problems
             WHERE id = $1
               AND source_test_id IS NULL`,
            [problemId]
        );

        if (problem.rowCount === 0) {
            throw new CustomTestQuestionError(
                "Problem not found in the public problem bank",
                404
            );
        }

        const existing = await client.query(
            `SELECT id
             FROM test_questions
             WHERE test_id = $1
               AND problem_id = $2
             LIMIT 1`,
            [testId, problemId]
        );

        if (existing.rowCount !== 0) {
            throw new CustomTestQuestionError(
                "This problem is already linked to the test",
                409
            );
        }

        const sequenceNumber = await nextSequenceNumber(client, testId);

        const testQuestion = await client.query(
            `INSERT INTO test_questions
                (test_id, question_type, problem_id, marks, sequence_number)
             VALUES ($1, 'coding', $2, $3, $4)
             RETURNING *`,
            [testId, problemId, marks, sequenceNumber]
        );

        await recalculateTotalMarks(client, testId);

        await client.query("COMMIT");

        return testQuestion.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function removeQuestionFromCustomTest(
    testId: number,
    studentId: string,
    testQuestionId: number
) {
    if (!Number.isInteger(testQuestionId) || testQuestionId <= 0) {
        throw new CustomTestQuestionError("A valid question is required");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await assertOwnership(client, testId, studentId);

        const question = await client.query(
            `SELECT
                tq.id,
                tq.question_type,
                tq.mcq_id,
                tq.problem_id,
                p.source_test_id
             FROM test_questions tq
             LEFT JOIN problems p ON p.id = tq.problem_id
             WHERE tq.id = $1
               AND tq.test_id = $2
             FOR UPDATE OF tq`,
            [testQuestionId, testId]
        );

        if (question.rowCount === 0) {
            throw new CustomTestQuestionError(
                "Question not found in this test",
                404
            );
        }

        const row = question.rows[0];

        await client.query(
            `DELETE FROM test_questions WHERE id = $1 AND test_id = $2`,
            [testQuestionId, testId]
        );

        if (
            String(row.question_type).toLowerCase() === "coding" &&
            row.problem_id !== null &&
            row.source_test_id !== null &&
            Number(row.source_test_id) === testId
        ) {
            // Contest-scoped problems belong only to this test. Deleting the
            // problem cascades its test cases and any remaining links.
            await client.query(
                `DELETE FROM problems WHERE id = $1 AND source_test_id = $2`,
                [row.problem_id, testId]
            );
        }

        if (String(row.question_type).toLowerCase() === "mcq" && row.mcq_id !== null) {
            await client.query(
                `DELETE FROM mcq_questions
                 WHERE id = $1
                   AND NOT EXISTS (
                       SELECT 1 FROM test_questions WHERE mcq_id = $1
                   )`,
                [row.mcq_id]
            );
        }

        await recalculateTotalMarks(client, testId);

        await client.query("COMMIT");

        return { id: testQuestionId };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
