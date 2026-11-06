import ExecutionService, { getStudentHistory } from "../services/ExecutionService.js";
import { Request,Response } from "express";
import { runCode } from "../services/ExecutionService.js";
import { ExecutionResult } from "../interfaces/ExecutionResult.js";
import { submitCode} from "../interfaces/SubmitCodeInterface.js";
import { parse } from "node:path";
import {pool} from "../database.js"
export default async function executeCode(req:Request,res:Response){
    const {problem_id,language,code}=req.body
    try{

        const result=await ExecutionService(Number(problem_id),language,code)
        return res.status(200).json(
            result
        )
    }catch(error:any){
        console.error("Execution error:", error);

        return res.status(500).json({
            status: "Failed",
            error: error.message
        });
    }
        
}

export async function runCodeControl(req:Request,res:Response){
    const {problem_id,language,code}=req.body
    try{

        const result=await runCode(Number(problem_id),language,code)
        res.status(200).json(
            result
        )
    }catch(error:any){
        console.error("Execution error:", error);

        return res.status(500).json({
            status: "Failed",
            error: error.message
        });
    }
}

export async function submitCode(req: Request, res: Response) {
    const student_id = req.user?.id;
    const { problem_id, language, code } = req.body;

    if (!student_id) {
        return res.status(401).json({
            status: "Failed",
            error: "Authentication Failed"
        });
    }

    if (!problem_id || !language || !code) {
        return res.status(400).json({
            status: "Failed",
            error: "Missing required fields"
        });
    }

    try {
        // Submit must evaluate the full suite (hidden + non-hidden).
        // Per-case details stay server-side because executeCode defaults to
        // summary-only results for submission paths.
        const result = await ExecutionService(
            Number(problem_id),
            language,
            code
        );
        const parsed_res = result;

        const status = parsed_res.status;

        const parsed_output = parsed_res.output
            ? JSON.parse(parsed_res.output)
            : { passed: 0, total: 0 };

        const passed = parsed_output.passed;
        const total = parsed_output.total;
        const query = `
            INSERT INTO problem_submissions (
                student_id,
                problem_id,
                language,
                source_code,
                passed_test_cases,
                total_test_cases,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            student_id,
            problem_id,
            language,
            code,
            passed,
            total,
            status
        ];

        const result_db = await pool.query(query, values);

        return res.status(200).json({
            status: result.status,
            passed,
            total,
            submission: result_db.rows[0]
        });

    } catch (error: any) {
        return res.status(500).json({
            status: "Failed",
            error: error.message
        });
    }
}

export async function getHistory(req:Request,res:Response){
    const student_id=req.user?.id
    if(!student_id){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authentication Failed"
        })
    }
    try{
        const result=await getStudentHistory(student_id)
        return res.status(200).json({
            result
        })
    }catch(error:any){
        return res.status(500).json({
            "status":"Failed",
            "error":error.message
        })
    }
}