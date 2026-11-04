import { Request,Response } from "express";
import { submitCode } from "../services/CodeSubmission.js";
import test from "node:test";

export async function submit(req:Request,res:Response){
    const {attemptId,testQuestionId,language,code}=req.body
    const parsedAttemptId=Number(attemptId)
    const parsedtqId=Number(testQuestionId)
    const studentId=req.user?.id
    if(!studentId){
        return res.status(401).json({
            "status":"Failed",
            "error":"Authentication Failed"}
        )
    }
     if (
        !Number.isInteger(parsedAttemptId) ||
        parsedAttemptId <= 0 ||
        !Number.isInteger(parsedtqId) ||
        parsedtqId<= 0 ||
        typeof language !== "string" ||
        !language.trim() ||
        typeof code !== "string" ||
        !code.trim()
    ) {
        return res.status(400).json({
            status: "Failed to Submit",
            error: "Valid attemptId, testQuestionId, language and code are required"
        });
    }
    try{
        const result=await submitCode(attemptId,testQuestionId,language,code,studentId)
        res.status(200).json({
            status: "Code submitted successfully",
            result:result
        })
    }catch(error:any){
         const message =
            error instanceof Error
                ? error.message
                : "Internal server error";

        const clientErrors = [
            "Attempt or coding question not found",
            "Attempt is not active"
        ];

        const statusCode = clientErrors.includes(message) ? 400 : 500;

        return res.status(statusCode).json({
            status: "Failed to Submit",
            error: message
        });
    }
}