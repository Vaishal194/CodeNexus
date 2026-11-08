import { Test,createTest} from "../interfaces/Contest.js";
import {pool} from "../database.js"
import { UpdateTest } from "../interfaces/updateTestInterface.js";
import { codingContest } from "../interfaces/createCodingProblemContest.js";

export async function addTest(adminId:string,data:createTest){
    const query=`
    INSERT INTO TESTS(title,description,duration_minutes,total_marks,created_by) VALUES($1,$2,$3,$4,$5)
    RETURNING *`;
    const values=[data.title,data.description,data.duration_minutes,data.total_marks,adminId]
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
    const query=`SELECT id,title,description,duration_minutes,total_marks FROM TESTS`
    const result=await pool.query(query,[])
    return result.rows
}

export async function fetchTestsById(id:Number){
    const query=`SELECT id,title,description,duration_minutes,total_marks FROM TESTS WHERE ID=$1`
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

export async function unPublishTest(testId:Number,adminId:string){
       const query = `
        UPDATE tests
        SET is_published = FALSE,
            updated_at = NOW()
        WHERE id = $1
          AND is_published = TRUE
        RETURNING *;
    `;
    const result = await pool.query(query, [
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
    const query=`SELECT id,title,description,duration_minutes,total_marks,
    created_by,test_type,visibility,start_time,end_time
    FROM tests where IS_PUBLISHED=$1`
    const res=await pool.query(query,[true])
    return res.rows
}

export async function testDetails(id:Number){
    const query=`SELECT id,title,description,duration_minutes,total_marks,
    created_by,test_type,visibility,start_time,end_time,is_published
    FROM tests where id=$1 AND IS_PUBLISHED=$2`
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

export async function updateTestDetails(testId: number, data: UpdateTest) {
    const fields = ["title", "description", "duration_minutes", "total_marks"] as const;

    const updates: string[] = [];
    const values: any[] = [];

    for (const field of fields) {
        if (data[field] !== undefined) {
            updates.push(`${field} = $${values.length + 1}`);
            values.push(data[field]);
        }
    }

    if (updates.length === 0) {
        throw new Error("No fields provided for update");
    }

    values.push(testId);

    const query = `
        UPDATE tests
        SET ${updates.join(", ")},
            updated_at = NOW()
        WHERE id = $${values.length}
        RETURNING *;
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
        throw new Error("Test not found");
    }

    return result.rows[0];
}

export async function addCodingQuestion(data:codingContest,test_id:number){
    const client=await pool.connect()
    try{
        
        await client.query("BEGIN")
        const query=`INSERT INTO PROBLEMS(
        title,description,difficulty,supported_languages,input_format,output_format,constraints,source_test_id
        )VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,description difficulty`

        const values=[data.title,data.description,data.difficulty,data.supported_languages,data.input,data.output,
        data.constraints,test_id
    ]


    const result=await client.query(query,values)
    const problemID=result.rows[0].id

    const sequenceResult = await client.query(
            `SELECT COALESCE(MAX(sequence_number), 0) + 1 AS next_sequence
             FROM test_questions
             WHERE test_id = $1`,
            [test_id]
        );
    const sequence_number = sequenceResult.rows[0].next_sequence;
    
    const questionQuery = `
            INSERT INTO test_questions (
                test_id,
                question_type,
                problem_id,
                marks,
                sequence_number
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const questionResult = await client.query(questionQuery, [
            test_id,
            "coding",
            problemID,
            1,
            sequence_number
        ]);
        await client.query("COMMIT");
         return {
            problem: result.rows[0],
            test_question: questionResult.rows[0]
        };
    }catch(error:any){
        await client.query("ROLLBACK")
        throw error
    }
    finally {
        client.release();
    }
}

export async function deleteCodingQuestion(problem_id:number,test_id:number){
    const query=`DELETE FROM PROBLEMS WHERE id=$1 AND source_test_id=$2`
    const values=[problem_id,test_id]
    const result=await pool.query(query,values)
    return result.rows
}