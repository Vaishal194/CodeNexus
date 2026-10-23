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