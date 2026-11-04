import { createProblem } from "../interfaces/createProblems.js";
import {pool} from "../database.js"
import { getProblemId } from "../interfaces/getProblemId.js";
import { getProblemList } from "../interfaces/geProblemsList.js";
export async function generateProblem(data:createProblem,adminId:string){
    const query=`
        INSERT INTO PROBLEMS(
        title,description,difficulty,supported_languages,input_format,output_format,constraints
        )VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING*
    `;
    const values=[
        data.title,data.description,data.difficulty,data.supported_languages,data.input,data.output,data.constraints
    ]
    const res=await pool.query(query,values)
    return res.rows[0]
}

export async function getProblemById(id:number):Promise<getProblemId>{
    const query=`SELECT id,title ,description,id,difficulty,
    supported_languages,input_format,output_format,constraints
    FROM PROBLEMS WHERE ID=$1;`
    const problemId=[id]
    const res=await pool.query(query,problemId)
    return res.rows[0]
}

export async function getProblemsList():Promise<getProblemList[]>{
    const query=`SELECT id,title,difficulty FROM PROBLEMS`
    const result=await pool.query(query,[])
    return result.rows
}

export async function deleteProblem(problem_id:number){
    const query=`DELETE FROM PROBLEMS WHERE ID=$1`
    const result=await pool.query(query,[problem_id])
    return result.rows
}

export async function updateProblem(problemId: number, data: any) {
    const {
        title,
        description,
        difficulty,
        supported_languages,
        input_format,
        output_format,
        constraints,
        time_limit_ms,
        memory_limit_mb
    } = data;

    const result = await pool.query(
        `UPDATE problems
         SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            difficulty = COALESCE($3, difficulty),
            supported_languages = COALESCE($4, supported_languages),
            input_format = COALESCE($5, input_format),
            output_format = COALESCE($6, output_format),
            constraints = COALESCE($7, constraints),
            time_limit_ms = COALESCE($8, time_limit_ms),
            memory_limit_mb = COALESCE($9, memory_limit_mb)
         WHERE id = $10
         RETURNING *`,
        [
            title,
            description,
            difficulty,
            supported_languages,
            input_format,
            output_format,
            constraints,
            time_limit_ms,
            memory_limit_mb,
            problemId
        ]
    );

    if (result.rowCount === 0) {
        throw new Error("Problem not found");
    }

    return result.rows[0];
}