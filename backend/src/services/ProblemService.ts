import { createProblem } from "../interfaces/createProblems.js";

import {pool} from "../database"

export default async function generateProblem(data:createProblem){
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