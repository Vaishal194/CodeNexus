import { createProblem } from "../interfaces/createProblems.js";
import {pool} from "../database.js"
import { getProblemId } from "../interfaces/getProblemId.js";
import { getProblemList } from "../interfaces/geProblemsList.js";
export async function generateProblem(data:createProblem){
    const query=`
        INSERT INTO PROBLEMS(
        title,description,difficulty,supported_languages,input_format,output_format,constraints
        )VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING*
    `;
    const values=[
        data.title,data.description,data.description,data.supported_languages,data.input,data.output,data.constraints
    ]
    const res=await pool.query(query,values)
    return res.rows[0]
}

export async function getProblemById(id:number):Promise<getProblemId>{
    const query=`SELECT title ,description,id,difficulty,
    supported_languages,input_format,output_format,constraints
    FROM PROBLEMS WHERE ID=$1;`
    const problemId=[id]
    const res=await pool.query(query,problemId)
    return res.rows[0]
}

export async function getProblemsList():Promise<getProblemList[]>{
    const query=`SELECT title,description,difficulty FROM PROBLEMS`
    const result=await pool.query(query,[])
    return result.rows
}