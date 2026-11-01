import express from "express"
import { Request,Response } from "express"
import { createTest } from "../interfaces/Contest.js"
import { addTest, fetchAllTests, fetchTestsById, publishTest, removeTest ,published, testDetails, fetchTestQuestions, updateTestDetails, unPublishTest} from "../services/ContestService.js"
import test from "node:test"
import { UpdateTest } from "../interfaces/updateTestInterface.js"

export async function create(req:Request,res:Response){
    const data:createTest=req.body
    const adminId=req.user?.id
    if(!adminId){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authentication Failed"
        })
    }
    try{
        const result=await addTest(adminId,data)
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
    const testId=Number(req.params.testId)
    const adminId=req.user?.id

    if(!Number.isInteger(testId) || testId<=0)
        return res.status(500).json({
    "status":"Failed",
    "error":"Invalid Test ID"
    })

    if(!adminId){
         return res.status(400).json({
    "status":"Failed",
    "error":"Authentication Failed"
    })
    }
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

export async function unPublish(req:Request,res:Response){
    const testId=Number(req.params.testId)
    const adminId=req.user?.id
    if(!adminId){
        return res.status(401).json({
            "status":"Failed",
            "error":"Authentication Failed "
        })
    }
    if(!Number.isInteger(testId) || testId<=0)
        return res.status(500).json({
         "status":"Failed",
         "error":"Invalid Test ID"
    })

    try{
          const result=await unPublishTest(testId,adminId)
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

export async function PublishedTests(req:Request,res:Response){
    try{
        const result=await published()
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

export async function fetchTestDetails(req:Request,res:Response){
    const id:Number=Number(req.params.id)
    try{
        const result=await testDetails(id)
        res.status(201).json({
            "status":`Success`,
            data:result
        })
    }catch(error:any){
         res.status(500).json({
            "status":"Failed to fetch the testDetails",
            "error":error.message
        })
    }
}

export async function fetchTestQuestion(req:Request,res:Response){
    const testId:Number=Number(req.params.id)
    try{
        const result=await fetchTestQuestions(testId)
        res.status(201).json({
            "status":`Success`,
            data:result
        })
    }catch(error:any){
         res.status(500).json({
            "status":"Failed to fetch the Questions",
            "error":error.message
        })
    }
}

export async function updateTest(req:Request,res:Response){
    const testId=Number(req.params.testId)
    const data:UpdateTest=req.body
    if(!Number.isInteger(testId) || testId<=0)
        return res.status(500).json({
         "status":"Failed",
         "error":"Invalid TestId"
    })

    try{
        const result=await updateTestDetails(testId,data)
        return res.status(200).json({
            result
        })
    }catch(error:any){
        return res.status(500).json({
            "status":"Failed",
            "error":"Internal Server Error"+error.message
        })
    }
}