import type { Request, Response } from "express";
import {deleteProblem, generateProblem,getProblemById, getProblemsList, updateProblem} from "../services/ProblemService.js";
import { createProblem } from "../interfaces/createProblems.js";
import { getProblemId } from "../interfaces/getProblemId.js";
import { getProblemList } from "../interfaces/geProblemsList.js";
import { error } from "node:console";

export async function postProblem(req: Request, res: Response) {
    const adminId=req.user?.id
    if(!adminId){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authorization Failed"
        })
    }
    try {
        console.log("Request body:", req.body);
        const data: createProblem = req.body
        console.log("Difficulty: ", data.difficulty)
        const problem = await generateProblem(data,adminId);

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

export async function deleteProblemById(req:Request,res:Response){
    const problem_id=Number(req.params.problem_id)
    if(!Number.isInteger(problem_id) || problem_id<=0)
        return res.status(500).json({
        "status":"Failed",
        "error":"Invalid Problem Id"
    })
    try{
        const result=await deleteProblem(problem_id)
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

export async function updateProblemById(req: Request, res: Response) {
    try {
        const problemId = Number(req.params.problemId);

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                message: "Invalid problem ID"
            });
        }

        const updatedProblem = await updateProblem(problemId, req.body);

        return res.status(200).json({
            message: "Problem updated successfully",
            problem: updatedProblem
        });

    } catch (error: any) {
        if (error.message === "Problem not found") {
            return res.status(404).json({ message: error.message });
        }

        console.error(error);

        return res.status(500).json({
            message: "Failed to update problem"
        });
    }
}