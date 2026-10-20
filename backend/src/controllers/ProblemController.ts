import type { Request, Response } from "express";
import generateProblem from "../services/ProblemService.js";
import { createProblem } from "../interfaces/createProblems.js";
export async function postProblem(req: Request, res: Response) {
    try {
        console.log("Request body:", req.body);
        const data:createProblem=req.body
        console.log("Difficulty: ",data.difficulty)
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
