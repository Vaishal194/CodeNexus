import { Request,Response } from "express";
import { MCQFormat } from "../interfaces/MCQ.js";
import { addQuestion, removeQuestion } from "../services/MCQService.js";

export async function addMCQ(req:Request,res:Response){
    const data:MCQFormat=req.body
    try{
        const result=await addQuestion(data)
        res.status(200).json({
            "status":"Successfull",
            "result":result,
        })
    }catch(error:any){
        res.status(500).json({
            "status":"Failed to add MCQ Question",
            "error":error.message,
        })
    }
}

export async function removeMCQ(req:Request,res:Response){
    const id:Number=Number(req.params.id)
    try{
        const result=await removeQuestion(id)
        res.status(200).json({
            "status":"Successfull",
            "result":result,
        })
    }catch(error:any){
        res.status(500).json({
            "status":"Failed to remove MCQ Question",
            "error":error.message,
        })
    }
}