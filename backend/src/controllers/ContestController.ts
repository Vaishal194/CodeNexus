import express from "express"
import { Request,Response } from "express"
import { createTest } from "../interfaces/Contest.js"
import { addTest, fetchAllTests, fetchTestsById, publishTest, removeTest } from "../services/ContestService.js"

export async function create(req:Request,res:Response){
    const data:createTest=req.body
    try{
        const result=await addTest(data)
        res.status(201).json({
            "status":"Test Added Successfully",
            data:result
        })
    }catch(error:any){
        res.status(500).json({
            "status":"Failed to add Test",
            "error":error.message
        })
    }
}

export async function remove(req:Request,res:Response){
    const id:Number=Number(req.params.id)
    try{
        const result=await removeTest(id)
        res.status(201).json({
            "status":`Test ${id} Removed Successfully`,
            data:result
        })
    }catch(error:any){
        res.status(500).json({
            "status":"Failed to remove Test",
            "error":error.message
        })
    }
}

export async function publish(req:Request,res:Response){
    const {testId,adminId}=req.body
    try{
        const result=await publishTest(testId,adminId)
        res.status(201).json({
            "status":`Test ${testId} published Successfully`,
            data:result
        })
    }catch(error:any){
        res.status(500).json({
            "status":"Failed to publish Test",
            "error":error.message
        })
    }
}

export async function fetchAll(req:Request,res:Response) {
    try{
        const result=await fetchAllTests()
        res.status(201).json({
            "status":`Success`,
            data:result
        })
    }catch(error:any){
        res.status(500).json({
            "status":"Failed to fetch all the Tests",
            "error":error.message
        })
    }
}

export async function fetchById(req:Request,res:Response) {
    const id:Number=Number(req.params.id)
    try{
        const result=await fetchTestsById(id)
        res.status(201).json({
            "status":`Success`,
            data:result
        })
    }catch(error:any){
        res.status(500).json({
            "status":"Failed to fetch the Tests",
            "error":error.message
        })
    }
}