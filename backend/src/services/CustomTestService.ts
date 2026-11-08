import { customTest } from "../interfaces/CustomTest.js";
import {pool} from "../database.js"
import test from "node:test";
import { UpdateTest } from "../interfaces/updateTestInterface.js";

export async function createTest(data:customTest,student_id:string){
    const query=`
        INSERT INTO TESTS(title,description,duration_minutes,total_marks,created_by,test_type
        ,join_code,visibility,start_time,end_time) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::timestamptz,$10::timestamptz)
        RETURNING id,title,total_marks,start_time,end_time,visibility`;

    const values=[data.title,data.description,data.duration_minutes,data.total_marks,student_id,'custom',data.join_code,
        data.visibility,data.start_time,data.end_time
    ]

    const result=await pool.query(query,values);
    return result.rows
}

export async function deleteTest(test_id:number,student_id:string){
    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        const owned = await client.query(
            `SELECT id FROM tests
             WHERE id=$1 AND created_by=$2 AND test_type='custom'
             FOR UPDATE`,
            [test_id, student_id]
        );

        if (owned.rowCount === 0) {
            await client.query("ROLLBACK");
            return [];
        }

        const mcqs = await client.query(
            `SELECT DISTINCT mcq_id
             FROM test_questions
             WHERE test_id=$1 AND mcq_id IS NOT NULL`,
            [test_id]
        );

        // Remove coding problems that were authored specifically for this
        // custom test so they do not leak into the public problem bank.
        await client.query(
            `DELETE FROM problems WHERE source_test_id=$1`,
            [test_id]
        );

        const result=await client.query(
            `DELETE FROM tests WHERE id=$1 AND created_by=$2 RETURNING *`,
            [test_id, student_id]
        );

        const mcqIds = mcqs.rows.map((row) => row.mcq_id);

        if (mcqIds.length > 0) {
            await client.query(
                `DELETE FROM mcq_questions
                 WHERE id = ANY($1::bigint[])
                   AND NOT EXISTS (
                       SELECT 1 FROM test_questions WHERE mcq_id = mcq_questions.id
                   )`,
                [mcqIds]
            );
        }

        await client.query("COMMIT");

        return result.rows;
    }catch(error){
        await client.query("ROLLBACK");
        throw error;
    }finally{
        client.release();
    }
}

export async function updateTestDetails(
    testId: number,
    data: UpdateTest,
    studentId: string
) {
    const fields = [
        "title",
        "description",
        "duration_minutes",
        "total_marks",
        "visibility",
        "join_code",
        "start_time",
        "end_time"
    ] as const;

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
    values.push(studentId);

    const query = `
        UPDATE tests
        SET ${updates.join(", ")},
            updated_at = NOW()
        WHERE id = $${values.length - 1}
          AND created_by = $${values.length}
          AND test_type = 'custom'
        RETURNING *;
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
        throw new Error("Custom test not found");
    }

    return result.rows[0];
}

export async function fetchTestsByOwnership(student_id:string){
    const query=`SELECT id,title,description
    ,duration_minutes,total_marks,is_published,
    visibility,join_code,start_time,end_time FROM tests WHERE created_by=$1`
    const result=await pool.query(query,[student_id])
    return result.rows
}

export async function fetchTestsByID(test_id:number,student_id:string){
     const query=`SELECT id,title,description
    ,duration_minutes,total_marks,is_published,
    visibility,join_code,start_time,end_time FROM tests WHERE created_by=$1 AND id=$2`

    const result=await pool.query(query,[student_id,test_id])

    return result.rows
}

export async function publishTest(test_id:number,student_id:string){
    const query = `
        UPDATE tests
        SET is_published = TRUE,
            published_by = $1,
            published_at = NOW(),
            updated_at = NOW()
        WHERE id = $2
          AND is_published = FALSE AND created_by=$3
        RETURNING *;
    `;
    const values=[student_id,test_id,student_id]

    const result=await pool.query(query,values)
    return result.rows[0]
}

export async function unPublishTest(test_id:number,student_id:string){
     const query = `
        UPDATE tests
        SET is_published = FALSE,
            updated_at = NOW()
        WHERE id = $1
          AND is_published = TRUE AND created_by=$2
        RETURNING *;
    `;
    const values=[test_id,student_id]

    const result=await pool.query(query,values)
    return result.rows[0]
}
