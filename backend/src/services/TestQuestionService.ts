import {pool} from "../database.js"
import { TestQuestion } from "../interfaces/TestQuestions.js";

export async function addQuestionTest(data:TestQuestion){
    const query=`INSERT INTO TEST_QUESTIONS (test_id,question_type,mcq_id,problem_id,marks,sequence_number)
    VALUES($1,$2,$3,$4,$5,$6) RETURNING *`
    const values=[data.test_id,data.question_type,data.mcq_id,data.problem_id,data.marks,data.sequence_number]
    const result=await pool.query(query,values)
    return result.rows[0]
}

export async function removeQuestionTest(id:Number){
    const query=`DELETE FROM TEST_QUESTIONS WHERE id=$1`
    const values=[id]
    const res=await pool.query(query,values)
    return res.rows[0]
}

export async function fetchAll(){
    const query='SELECT *FROM TEST_QUESTIONS'
    const res=await pool.query(query,[])
    return res.rows
}

export async function fetchById(id:Number){
    const query=`SELECT *FROM TEST_QUESTIONS WHERE id=$1`
    const res=await pool.query(query,[id])
    return res.rows
}