import type { Request, Response } from "express";
import {generateProblem,getProblemById, getProblemsList} from "../services/ProblemService.js";
import { createProblem } from "../interfaces/createProblems.js";
import { getProblemId } from "../interfaces/getProblemId.js";
import { getProblemList } from "../interfaces/geProblemsList.js";
export async function postProblem(req: Request, res: Response) {
    try {
        console.log("Request body:", req.body);
        const data: createProblem = req.body
        console.log("Difficulty: ", data.difficulty)
        const problem = await generateProblem(req.body);

        return res.status(201).json({
            message: "Problem created successfully",
            data: problem
        });
    } catch (error) {
        console.error("Create problem error:", error);

        return res.status(500).json({
            error: "Failed to create problem",
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
export async function getProblem(req:Request,res:Response){
    const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid problem ID"
            });
        }
    try{
        const result:getProblemId=await getProblemById(id)
        return res.status(201).json({
            result
        })
    }catch(error:any){
        return res.status(500).json({
            error:"Problem Not Found",
            details: error instanceof Error ? error.message : String(error)
        })
    }
}

export async function fetchProblemList(req:Request,res:Response){
    try{
        const result:getProblemList[]=await getProblemsList()
        res.status(201).json(result)
    }catch(error:any){
        return res.status(500).json({
             details: error instanceof Error ? error.message : String(error)
        })
    }
}