import test from "node:test";
import { fetchAdminDetailedResultById, fetchAttempts, fetchResults } from "../services/TestAttemptAdmin.js";
import { Request,Response } from "express";
import { error } from "node:console";

export async function fecthAttemptsByTestId(req:Request,res:Response){
    const testId=Number(req.params.testId)
    const adminId=req.user?.id
    if(!adminId){
        return res.status(400).json({
            "status":"Failed",
            error:"Authorization Failed"
        });
    }

    if(!Number.isInteger(testId) || testId<=0)
        return res.status(500).json({
    "error":"Failed",
    "status":"Invalid TestId"
    })
    try{
        const result=await fetchAttempts(testId,adminId)
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

export async function fetchResultByAttemptId(req:Request,res:Response) {
    const attempt_id=Number(req.params.attempt_id)
    const adminId=req.user?.id
    if(!adminId){
        return res.status(400).json({
            "status":"Failed",
            error:"Authorization Failed"
        });
    }

    if(!Number.isInteger(attempt_id) || attempt_id<=0)
        return res.status(500).json({
        "error":"Failed",
        "status":"Invalid attemptId"
    })
    try{
        const result=await fetchResults(attempt_id,adminId)
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

export async function fetchDetailedResultByAttemptId(req:Request,res:Response){
    const attemptId=Number(req.params.attemptId)
    if(!Number.isInteger(attemptId) || attemptId<=0)
        return res.status(500).json({
        "error":"Failed",
        "status":"Invalid attemptId"
    })

    const adminId=req.user?.id
    if(!adminId){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authorization Failed"
        })
    }

    try{
        const result=await fetchAdminDetailedResultById(attemptId,adminId)
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