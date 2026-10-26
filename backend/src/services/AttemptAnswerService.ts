import { pool } from "../database.js";

export async function saveMCQAnswer(
    attemptId: number,
    testQuestionId: number,
    selectedOption: number
) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const attempt = await client.query(
            `SELECT id, test_id
             FROM test_attempts
             WHERE id = $1
               AND status = 'IN_PROGRESS'
             FOR UPDATE`,
            [attemptId]
        );

        if (attempt.rowCount === 0) {
            throw new Error("Attempt not found or already submitted");
        }
        const question = await client.query(
            `SELECT mcq.id, mcq.options
   FROM test_questions AS tq
   INNER JOIN mcq_questions AS mcq
      ON mcq.id = tq.mcq_id
   WHERE tq.id = $1
     AND tq.test_id = $2
     AND LOWER(tq.question_type) = 'mcq'`,
            [Number(testQuestionId), Number(attempt.rows[0].test_id)]
        );

        console.log("Question lookup:", {
            testQuestionId,
            testId: attempt.rows[0].test_id,
            rowCount: question.rowCount,
            rows: question.rows
        });

        if (question.rowCount === 0) {
            throw new Error("MCQ question not found in this test");
        }

        if (question.rowCount === 0) {
            throw new Error("MCQ question not found in this test");
        }

        const options = question.rows[0].options;

        if (
            !Number.isInteger(selectedOption) ||
            selectedOption < 0 ||
            selectedOption >= options.length
        ) {
            throw new Error("Invalid option index");
        }

        const result = await client.query(
            `INSERT INTO attempt_answers
                (attempt_id, test_question_id, selected_option)
             VALUES ($1, $2, $3)
             ON CONFLICT (attempt_id, test_question_id)
             DO UPDATE SET
                selected_option = EXCLUDED.selected_option,
                submitted_at = NOW()
             RETURNING *`,
            [attemptId, testQuestionId, selectedOption]
        );

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}