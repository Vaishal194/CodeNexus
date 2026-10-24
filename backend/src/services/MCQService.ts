import { MCQFormat } from "../interfaces/MCQ.js";
import {pool} from "../database.js"

export async function addQuestion(data:MCQFormat){
    const query=`INSERT INTO mcq_questions (question,options,correct_option,explanation)VALUES($1,$2,$3,$4) RETURNING *`
    const values=[data.question,JSON.stringify(data.options),data.correct_option,data.explanation]
    const result=await pool.query(query,values)
    return result.rows[0]
}

export async function removeQuestion(id:Number){
    const query='DELETE FROM mcq_questions WHERE id=$1'
    const values=[id]
    const res=await pool.query(query,values)
    return res.rows[0]
}