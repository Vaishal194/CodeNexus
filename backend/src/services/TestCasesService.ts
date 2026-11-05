import { testCase } from "../interfaces/testCase.js";
import {pool} from '../database.js'

export async function addTestCase(data:testCase){
    const query=`INSERT INTO TEST_CASES(problem_id,input,expected_output,is_hidden,sequence_number) 
    VALUES($1,$2,$3,$4,$5) RETURNING *`
    const values=[data.problem_id,data.input,data.expected_output,data.is_hidden,data.sequence_number]
    const res=await pool.query(query,values)
    return res.rows[0]
}

export async function removeTestCase(id: number) {
    const query = `DELETE FROM TEST_CASES WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id]);

    if (res.rowCount === 0) {
        throw new Error("Test case not found");
    }

    return res.rows[0];
}

export async function getTestCases(id:number){
    const query=`SELECT INPUT,expected_output FROM TEST_CASES WHERE problem_id=$1 AND is_hidden=$2`
    const values=[id,false]
    const res=await pool.query(query,values)
    return res.rows
}

export async function getHiddenCases(id:number){
    const query=`SELECT INPUT,expected_output FROM TEST_CASES WHERE problem_id=$1 AND is_hidden=$2`
    const values=[id,true]
    const res=await pool.query(query,values)
    return res.rows
}

export async function generateAllTestCases(problem_id:number){
    const query = `
        SELECT id, input, expected_output, is_hidden, sequence_number
        FROM test_cases
        WHERE problem_id = $1
        ORDER BY sequence_number ASC, id ASC
    `;

    const result = await pool.query(query, [problem_id]);
    return result.rows;
}

export async function generateNonHiddenTestCases(problem_id:number){
    const query=`SELECT id,input,expected_output,is_hidden,sequence_number
    FROM test_cases WHERE problem_id=$1 AND is_hidden=$2
    ORDER BY sequence_number ASC, id ASC`
    const values=[problem_id,false]
    const result=await pool.query(query,values)
    return result.rows;
}