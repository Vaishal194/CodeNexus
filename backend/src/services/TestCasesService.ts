import { testCase } from "../interfaces/testCase.js";
import {pool} from '../database.js'

export async function addTestCase(data:testCase){
    const query=`INSERT INTO TEST_CASES(problem_id,input,expected_output,is_hidden,sequence_number) 
    VALUES($1,$2,$3,$4,$5) RETURNING *`
    const values=[data.problem_id,data.input,data.expected_output,data.is_hidden,data.sequence_number]
    const res=await pool.query(query,values)
    return res.rows[0]
}

export async function removeTestCase(id:Number){
    const query=`DELETE FROM TEST_CASES WHERE id=$1`
    const values=[id]
    const res=await pool.query(query,values)
    return res.rows[0]
}

export async function getTestCases(id:Number){
    const query=`SELECT INPUT,expected_output FROM TEST_CASES WHERE problem_id=$1 AND is_hidden=$2`
    const values=[id,false]
    const res=await pool.query(query,values)
    return res.rows
}

export async function getHiddenCases(id:Number){
    const query=`SELECT INPUT,expected_output FROM TEST_CASES WHERE problem_id=$1 AND is_hidden=$2`
    const values=[id,true]
    const res=await pool.query(query,values)
    return res.rows
}