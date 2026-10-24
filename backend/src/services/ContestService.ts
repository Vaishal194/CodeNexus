import { Test,createTest} from "../interfaces/Contest.js";
import {pool} from "../database.js"

export async function addTest(data:createTest){
    const query=`
    INSERT INTO TESTS(title,description,duration_minutes,total_marks) VALUES($1,$2,$3,$4)
    RETURNING *`;
    const values=[data.title,data.description,data.duration_minutes,data.total_marks]
    const result=await pool.query(query,values)
    return result.rows[0]
}

export async function removeTest(test_id:Number){
    const query=`DELETE FROM TESTS WHERE ID=$1`
    const values=[test_id]
    const result=await pool.query(query,values)
    return result.rows[0]
}

export async function fetchAllTests(){
    const query=`SELECT title,description,duration_minutes,total_marks FROM TESTS`
    const result=await pool.query(query,[])
    return result.rows
}

export async function fetchTestsById(id:Number){
    const query=`SELECT title,description,duration_minutes,total_marks FROM TESTS WHERE ID=$1`
    const result=await pool.query(query,[id])
    return result.rows
}

export async function publishTest(testId:Number,adminId:string){
    const query = `
        UPDATE tests
        SET is_published = TRUE,
            published_by = $1,
            published_at = NOW(),
            updated_at = NOW()
        WHERE id = $2
          AND is_published = FALSE
        RETURNING *;
    `;

    const result = await pool.query(query, [
        adminId,
        testId
    ]);

    if (result.rowCount === 0) {
        throw new Error(
            "Test not found or already published"
        );
    }

    return result.rows[0];
}

export async function published(){
    const query=`SELECT id,title,description,duration_minutes,total_marks FROM tests where IS_PUBLISHED=$1`
    const res=await pool.query(query,[true])
    return res.rows
}

export async function testDetails(id:Number){
    const query=`SELECT id,title,description,duration_minutes,total_marks FROM tests where id=$1 AND IS_PUBLISHED=$2`
    const res=await pool.query(query,[id,true])
    return res.rows
}

export async function fetchTestQuestions(testId: Number) {
    const query = `
        SELECT
            tq.id AS test_question_id,
            tq.test_id,
            tq.question_type,
            tq.marks,
            tq.sequence_number,

            mcq.id AS mcq_id,
            mcq.question AS mcq_question,
            mcq.options AS mcq_options,

            p.id AS problem_id,
            p.title AS problem_title,
            p.description AS problem_description,
            p.difficulty AS problem_difficulty,
            p.supported_languages,
            p.input_format AS input_format,
            p.output_format AS output_format,
            p.constraints

        FROM test_questions tq

        LEFT JOIN mcq_questions mcq
            ON tq.mcq_id = mcq.id

        LEFT JOIN problems p
            ON tq.problem_id = p.id

        WHERE tq.test_id = $1

        ORDER BY tq.sequence_number ASC;
    `;

    const result = await pool.query(query, [testId]);

    return result.rows;
}