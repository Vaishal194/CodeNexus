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
    const query=`DELETE FROM TESTS WHERE id=$1 AND created_by=$2`
    const values=[test_id,student_id]
    const result=await pool.query(query,values)
    return result.rows
}

export async function updateTestDetails(
    testId: number,
    data: UpdateTest
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

    const query = `
        UPDATE tests
        SET ${updates.join(", ")},
            updated_at = NOW()
        WHERE id = $${values.length}
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
