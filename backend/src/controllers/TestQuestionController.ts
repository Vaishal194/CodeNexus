import { Request,Response } from "express";
import { TestQuestion } from "../interfaces/TestQuestions.js";
import { addQuestionTest, fetchAll, fetchById, removeQuestionTest } from "../services/TestQuestionService.js";

export async function addQuestion(req:Request,res:Response){
    const data:TestQuestion=req.body
    try{
        const result=await addQuestionTest(data)
        res.status(200).json({
            "status":"Added Question",
            "result":result
        })
    }catch(error:any){
        res.status(500).json({
            "status":"Failed",
            "error":error.message
        })
    }
}

export async function deleteQuestion(req:Request,res:Response){
    const id:Number=Number(req.params.body)
    try{
        const result=await removeQuestionTest(id)
        res.status(200).json({
            "status":"Removed Question",
            "result":result
        })
    }catch(error:any){
        res.status(500).json({
            "status":"Failed",
            "error":error.message
        })
    }
}

export async function fetchAllQuestions(req:Request,res:Response){
    try{
        const result=await fetchAll()
        res.status(200).json({
            "status":"Successfull Fetch",
            "result":result
        })
    }catch(error:any){
        res.status(500).json({
            "status":"Failed",
            "error":error.message
        })
    }
}

export async function fetchTestQuestionById(req:Request,res:Response){
    const id:Number=Number(req.params.body)
    try{
        const result=await fetchById(id)
        res.status(200).json({
            "status":"Fetched Question",
            "result":result
        })
    }catch(error:any){
        res.status(500).json({
            "status":"Failed",
            "error":error.message
        })
    }
}