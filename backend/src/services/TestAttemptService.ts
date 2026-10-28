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
    const result = await pool.query(
        `SELECT
            id,
            test_id,
            student_id,
            started_at,
            submitted_at,
            status,
            total_marks,
            score
         FROM test_attempts
         WHERE id = $1`,
        [attemptId]
    );

    if (result.rowCount === 0) {
        throw new Error("Attempt not found");
    }

    return result.rows[0];
}

export async function submitAttempt(attempt_id: number) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Lock the attempt to prevent concurrent final submissions.
        const attemptResult = await client.query(
            `SELECT id, status
             FROM test_attempts
             WHERE id = $1
             FOR UPDATE`,
            [attempt_id]
        );

        if (attemptResult.rowCount === 0) {
            throw new Error("Attempt not found");
        }

        if (attemptResult.rows[0].status !== "IN_PROGRESS") {
            throw new Error(
                "Attempt has already been submitted or is not active"
            );
        }

        // 2. Do not finalize while code is still executing.
        const runningCode = await client.query(
            `SELECT id
             FROM code_submissions
             WHERE attempt_id = $1
               AND status IN ('PENDING', 'RUNNING')
             LIMIT 1`,
            [attempt_id]
        );

        if (runningCode.rowCount !== 0) {
            throw new Error(
                "Code execution is still running. Please wait."
            );
        }

        // 3. Grade all answered MCQ questions.
        await client.query(
            `UPDATE attempt_answers AS aa
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
               AND LOWER(tq.question_type) = 'mcq'`,
            [attempt_id]
        );

        // 4. Calculate MCQ score.
        const scoreResult = await client.query(
            `SELECT COALESCE(SUM(aa.marks_awarded), 0) AS score
             FROM attempt_answers AS aa
             JOIN test_questions AS tq
                 ON tq.id = aa.test_question_id
             WHERE aa.attempt_id = $1
               AND LOWER(tq.question_type) = 'mcq'`,
            [attempt_id]
        );

        // 5. Calculate the best score for each coding question.
        const codeScore = await client.query(
            `SELECT COALESCE(SUM(best_marks), 0) AS coding_score
             FROM (
                 SELECT
                     cs.test_question_id,
                     MAX(cs.marks_awarded) AS best_marks
                 FROM code_submissions AS cs
                 JOIN test_questions AS tq
                     ON tq.id = cs.test_question_id
                 WHERE cs.attempt_id = $1
                   AND LOWER(tq.question_type) = 'coding'
                   AND cs.status NOT IN ('PENDING', 'RUNNING')
                 GROUP BY cs.test_question_id
             ) AS best_submissions`,
            [attempt_id]
        );

        const mcqMarks = Number(scoreResult.rows[0].score);
        const codingMarks = Number(codeScore.rows[0].coding_score);
        const score = mcqMarks + codingMarks;

        // 6. Save the final score and submit the attempt.
        const submit = await client.query(
            `UPDATE test_attempts
             SET score = $1,
                 status = 'SUBMITTED',
                 submitted_at = NOW()
             WHERE id = $2
               AND status = 'IN_PROGRESS'
             RETURNING id, test_id, score, total_marks,
                       status, submitted_at`,
            [score, attempt_id]
        );

        if (submit.rowCount === 0) {
            throw new Error("Unable to submit attempt");
        }

        await client.query("COMMIT");

        return submit.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
