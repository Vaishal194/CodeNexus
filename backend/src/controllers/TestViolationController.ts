import { Request,Response } from "express";
import { violation } from "../interfaces/TestViolation.js";
import { addViolation, isDisqualified } from "../services/TestViolation.js";

export async function violated(req:Request,res:Response){
    const studentId=req.user?.id
    const attemptId=Number(req.params.attemptId)
    const testId=Number(req.params.testId)
    const data:violation=req.body
    if(!Number.isInteger(attemptId) || attemptId<=0){
        return res.status(500).json({
            "status":"Failed",
            "error":"Invalid Attempt ID"
        })
    }
    if(!Number.isInteger(testId) || testId<=0){
        return res.status(500).json({
            "status":"Failed",
            "error":"Invalid Test ID"
        })
    }
    if(!studentId){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authentication Failed"
        })
    }

    try{
        const result=await addViolation(attemptId,studentId,testId,data)
        return res.status(200).json({
            result
        })
    }catch(error:any){
        return res.status(500).json({
            "Status":"Failed",
            "error":error.message
        })
    }
}

export async function CheckIsDisqualified(req:Request,res:Response){
    const student_id=req.user?.id
    if(!student_id){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authentication Failed"
        })
    }
    const attemptId=Number(req.params.attemptId)
    const testId=Number(req.params.testId)
    if(!Number.isInteger(attemptId) || attemptId<=0){
        return res.status(500).json({
            "status":"Failed",
            "error":"Invalid Attempt ID"
        })
    }
    if(!Number.isInteger(testId) || testId<=0){
        return res.status(500).json({
            "status":"Failed",
            "error":"Invalid Test ID"
        })
    }
    try{
        const result=await isDisqualified(attemptId,testId,student_id)
        return res.status(200).json({
            result
        })
    }catch(error:any){
        return res.status(500).json({
            "Status":"Failed",
            "error":error.message
        })   
    }
}