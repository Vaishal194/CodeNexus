import { testCase } from "../interfaces/testCase.js";
import { addTestCase, getHiddenCases, getTestCases, removeTestCase } from "../services/TestCasesService.js";
import { Request,Response } from "express";

export async function addCase(req:Request,res:Response){
    const data:testCase=req.body
    try{
        const result=await addTestCase(data)
        res.status(201).json({
            "status":"Successfully Added a Test Case"
        })
    }catch(error:any){
        res.status(500).json({
            "status":"Failed to add Test Cases",
            "error":error.message
        })
    }
}

export async function removeCase(req:Request,res:Response){
    const id=Number(req.params.id)
    try{
        const result=await removeTestCase(id)
        res.status(201).json({
            "status":`Successfully Removed Test Case: ${id}`
        })

    }catch(error:any){
        res.status(500).json({
            "status":"Failed to remove Test Cases",
            "error":error.message
        })
    }
}

export async function getHiddenCasesById(req:Request,res:Response){
    const id=Number(req.params.id)
    try{
        const result=await getHiddenCases(id)
        return res.status(201).send(result)

    }catch(error:any){
        res.status(500).json({
            "error":error.message
        })
    }
}

export async function getTestCasesById(req:Request,res:Response){
    const id=Number(req.params.id)
    try{
        const result=await getTestCases(id)
        return res.status(201).send(result)

    }catch(error:any){
        res.status(500).json({
            "error":error.message
        })
    }
}