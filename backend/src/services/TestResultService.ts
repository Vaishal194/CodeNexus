
import { pool } from "../database.js";

export async function getAttemptResult(attemptId: number) {
    const attemptResult = await pool.query(
        `SELECT
            ta.id AS attempt_id,
            ta.test_id,
            ta.student_id,
            ta.status AS attempt_status,
            ta.score,
            ta.total_marks,
            ta.started_at,
            ta.submitted_at,
            t.title AS test_title,
            CASE
                WHEN ta.total_marks > 0
                THEN ROUND((ta.score::numeric / ta.total_marks) * 100, 2)
                ELSE 0
            END AS percentage
        FROM test_attempts ta
        JOIN tests t ON t.id = ta.test_id
        WHERE ta.id = $1`,
        [attemptId]
    );

    if (attemptResult.rowCount === 0) {
        throw new Error("Attempt not found");
    }

    const attempt = attemptResult.rows[0];

    if (attempt.attempt_status !== "SUBMITTED") {
        throw new Error("Results are not available until the attempt is submitted");
    }

    const questionResult = await pool.query(
        `SELECT
            tq.id AS test_question_id,
            tq.question_type,
            tq.marks AS maximum_marks,
            COALESCE(aa.marks_awarded, 0) AS marks_awarded,
            aa.selected_option,
            CASE
                WHEN LOWER(tq.question_type) = 'mcq'
                    AND aa.selected_option IS NOT NULL
                THEN aa.selected_option = mcq.correct_option
                ELSE NULL
            END AS is_correct,
            cs.language,
            cs.status AS coding_status,
            cs.passed_test_cases,
            cs.total_test_cases
        FROM test_questions tq
        LEFT JOIN attempt_answers aa
            ON aa.test_question_id = tq.id
            AND aa.attempt_id = $1
        LEFT JOIN mcq_questions mcq
            ON mcq.id = tq.mcq_id
        LEFT JOIN LATERAL (
            SELECT
                c.language,
                c.status,
                c.passed_test_cases,
                c.total_test_cases,
                c.marks_awarded
            FROM code_submissions c
            WHERE c.attempt_id = $1
              AND c.test_question_id = tq.id
              AND c.status NOT IN ('PENDING', 'RUNNING')
            ORDER BY c.marks_awarded DESC, c.submitted_at DESC
            LIMIT 1
        ) cs ON TRUE
        WHERE tq.test_id = $2
        ORDER BY tq.sequence_number`,
        [attemptId, attempt.test_id]
    );

    const questions = questionResult.rows.map((q: any) => ({
        test_question_id: q.test_question_id,
        question_type: q.question_type,
        maximum_marks: Number(q.maximum_marks),
        marks_awarded: Number(
            q.question_type.toLowerCase() === "coding"
                ? q.marks_awarded
                : q.marks_awarded
        ),
        ...(q.question_type.toLowerCase() === "mcq"
            ? {
                selected_option: q.selected_option,
                is_correct: q.is_correct
            }
            : {
                language: q.language,
                status: q.coding_status,
                passed_test_cases: q.passed_test_cases,
                total_test_cases: q.total_test_cases
            })
    }));

    return {
        ...attempt,
        score: Number(attempt.score),
        total_marks: Number(attempt.total_marks),
        percentage: Number(attempt.percentage),
        questions
    };
}
