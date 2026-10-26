import { pool } from "../database.js";

export async function startAttempt(
    testId: number,
    studentId: string
) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const test = await client.query(
            `SELECT id
             FROM tests
             WHERE id = $1
               AND is_published = TRUE
             FOR SHARE`,
            [testId]
        );

        if (test.rowCount === 0) {
            throw new Error("Test not found or not published");
        }

        const marksResult = await client.query(
            `SELECT COALESCE(SUM(marks), 0) AS total_marks
             FROM test_questions
             WHERE test_id = $1`,
            [testId]
        );

        const totalMarks = Number(
            marksResult.rows[0].total_marks
        );

        const result = await client.query(
            `INSERT INTO test_attempts
                (test_id, student_id, total_marks)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [testId, studentId, totalMarks]
        );

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error: any) {
        await client.query("ROLLBACK");

        if (error.code === "23505") {
            throw new Error(
                "You have already started or attempted this test"
            );
        }

        throw error;
    } finally {
        client.release();
    }
}

export async function getAttempt(attemptId: number) {
    const query = `
        SELECT
            id,
            test_id,
            student_id,
            started_at,
            submitted_at,
            status,
            total_marks,
            score
        FROM test_attempts
        WHERE id = $1
    `;

    const result = await pool.query(query, [attemptId]);

    if (result.rowCount === 0) {
        throw new Error("Attempt not found");
    }

    return result.rows[0];
}

export async function submitAttempt(attempt_id: number) {
    try {
        await pool.query("BEGIN")
        const attempt = await pool.query(`
            SELECT ID,STATUS FROM TEST_ATTEMPTS WHERE ID=$1 FOR UPDATE`, [attempt_id])
        if (attempt.rowCount === 0) {
            throw new Error("Attempt not found");
        }

        if (attempt.rows[0].status !== "IN_PROGRESS") {
            throw new Error("Attempt has already been submitted");
        }
        const grade = await pool.query(`
    UPDATE attempt_answers AS aa
    SET marks_awarded =
        CASE
            WHEN aa.selected_option = mcq.correct_option
            THEN tq.marks
            ELSE 0
        END
    FROM test_questions AS tq
    JOIN mcq_questions AS mcq
        ON mcq.id = tq.mcq_id
    WHERE aa.attempt_id = $1
      AND aa.test_question_id = tq.id
      AND LOWER(tq.question_type) = 'mcq'
    `, [attempt_id]);

        const scoreResult = await pool.query(
            `SELECT COALESCE(SUM(aa.marks_awarded), 0) AS score
             FROM attempt_answers AS aa
             JOIN test_questions AS tq
                 ON tq.id = aa.test_question_id
             WHERE aa.attempt_id = $1
               AND LOWER(tq.question_type) = 'mcq'`,
            [attempt_id]
        );

        const score = Number(scoreResult.rows[0].score);

        const submit = await pool.query(`
            UPDATE TEST_ATTEMPTS AS TQ SET score=$1, STATUS='SUBMITTED',submitted_at=NOW() WHERE id = $2
             RETURNING id, test_id, score, status, submitted_at`,
            [score, attempt_id])
        await pool.query("COMMIT");

        return submit.rows[0];

    } catch (error: any) {
        await pool.query("ROLLBACK");
        throw error;
    }
}