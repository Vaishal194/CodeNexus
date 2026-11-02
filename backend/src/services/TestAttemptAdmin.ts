import { pool } from "../database.js"
export async function fetchAttempts(testId: number, adminId: string) {
    const query = `SELECT
    ta.id AS attempt_id,
    ta.test_id,
    ta.student_id,
    p.full_name AS student_name,
    ta.status,
    ta.started_at,
    ta.submitted_at,
    ta.total_marks,
    ta.score
    FROM test_attempts ta
    JOIN profiles p
    ON ta.student_id = p.id::TEXT
    WHERE ta.test_id = $1
    ORDER BY ta.started_at DESC;`
    const values = [testId]
    const result = await pool.query(query, values)
    return result.rows
}

export async function fetchResults(attempt_id: number, adminId: string) {
    const attemptQuery = `
    SELECT
        ta.id AS attempt_id,
        ta.test_id,
        t.title AS test_title,
        ta.student_id,
        p.full_name AS student_name,
        ta.status,
        ta.started_at,
        ta.submitted_at,
        ta.total_marks,
        ta.score
    FROM test_attempts ta
    JOIN profiles p
        ON ta.student_id = p.id::TEXT
    JOIN tests t
        ON ta.test_id = t.id
    WHERE ta.id = $1;
`;

    const result = await pool.query(attemptQuery, [attempt_id]);

    if (result.rows.length === 0) {
        throw new Error("Attempt not found");
    }

    const attempt = result.rows[0];

    if (attempt.status !== "SUBMITTED") {
        throw new Error("Attempt has not been submitted yet");
    }
    return attempt.rows
}


export async function fetchAdminDetailedResultById(attemptId: number,adminId:string) {
    console.log("Attempt ID received:", attemptId);
    const attemptQuery = `
        SELECT
            ta.id AS attempt_id,
            ta.test_id,
            t.title AS test_title,
            ta.student_id,
            p.full_name AS student_name,
            ta.status,
            ta.started_at,
            ta.submitted_at,
            ta.total_marks,
            ta.score
            FROM test_attempts ta
            LEFT JOIN profiles p
            ON ta.student_id = p.id::TEXT
            JOIN tests t
            ON ta.test_id = t.id    
            WHERE ta.id = $1;
            `;

    const attemptResult = await pool.query(attemptQuery, [attemptId]);
    console.log("Attempt query result:", attemptResult.rows);
    console.log("Rows count:", attemptResult.rows.length);
    if (attemptResult.rows.length === 0) {
        throw new Error("Attempt not found");
    }

    const attempt = attemptResult.rows[0];

    if (attempt.status !== "SUBMITTED") {
        throw new Error("Attempt has not been submitted yet");
    }

    const mcqQuery = `
        SELECT
            tq.id AS test_question_id,
            mq.id AS mcq_id,
            mq.question,
            mq.options,
            aa.selected_option,
            mq.correct_option,
            CASE
                WHEN aa.selected_option = mq.correct_option
                THEN TRUE
                ELSE FALSE
            END AS is_correct,
            tq.marks AS maximum_marks,
            COALESCE(aa.marks_awarded, 0) AS marks_awarded,
            aa.submitted_at
        FROM test_attempts ta
        JOIN test_questions tq
            ON ta.test_id = tq.test_id
        JOIN mcq_questions mq
            ON tq.mcq_id = mq.id
        LEFT JOIN attempt_answers aa
            ON aa.attempt_id = ta.id
            AND aa.test_question_id = tq.id
        WHERE ta.id = $1
            AND tq.question_type = 'MCQ'
        ORDER BY tq.sequence_number;
    `;

    const mcqResult = await pool.query(mcqQuery, [attemptId]);

    const codingQuery = `
        SELECT
            tq.id AS test_question_id,
            p.id AS problem_id,
            p.title AS problem_title,
            tq.marks AS maximum_marks,
            cs.id AS submission_id,
            cs.language,
            cs.source_code,
            cs.status,
            cs.passed_test_cases,
            cs.total_test_cases,
            cs.marks_awarded,
            cs.submitted_at
        FROM test_attempts ta
        JOIN test_questions tq
            ON ta.test_id = tq.test_id
        JOIN problems p
            ON tq.problem_id = p.id
        LEFT JOIN LATERAL (
            SELECT *
            FROM code_submissions cs
            WHERE cs.attempt_id = ta.id
                AND cs.test_question_id = tq.id
            ORDER BY cs.marks_awarded DESC NULLS LAST, cs.id DESC
            LIMIT 1
        ) cs ON TRUE
        WHERE ta.id = $1
            AND tq.question_type = 'Coding'
        ORDER BY tq.sequence_number;
    `;

    const codingResult = await pool.query(codingQuery, [attemptId]);

    return {
        attempt,
        mcq_results: mcqResult.rows,
        coding_results: codingResult.rows
    };
}