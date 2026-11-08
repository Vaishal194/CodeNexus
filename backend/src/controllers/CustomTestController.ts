import test from "node:test"
import { customTest } from "../interfaces/CustomTest.js"
import {createTest,deleteTest,fetchTestsByID,fetchTestsByOwnership,publishTest,unPublishTest,updateTestDetails} from "../services/CustomTestService.js"
import { Request,Response } from "express"
import { UpdateTest } from "../interfaces/updateTestInterface.js"

export async function createCustomTest(req:Request,res:Response){
    const student_id=req.user?.id
    const data:customTest=req.body
    if(!student_id){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authentication Failed"
        })
    }
    try{
        const result=await createTest(data,student_id)
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

export async function deleteCustomTest(req:Request,res:Response){
    const student_id=req.user?.id
    if(!student_id){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authentication Failed"
        })
    }
    const test_id=Number(req.params.test_id)
    if(!Number.isInteger(test_id) || test_id<=0)
        return res.status(500).json({
            "status":"Failed",
            "error":"Invalid Test ID"
    })

    try{
        const result=await deleteTest(test_id,student_id)
        return res.status(200).json({
            result
        })
    }catch(error:any){
        return res.status(500).json({
            "status":"Failed",
            "error":""+error.message
        })
    }
}

export async function updateCustomTest(req:Request,res:Response){
   const student_id=req.user?.id
   if(!student_id){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authentication Failed"
        })
   }
   const test_id=Number(req.params.test_id)
   if(!Number.isInteger(test_id) || test_id<=0)
        return res.status(500).json({
            "status":"Failed",
            "error":"Invalid Test ID"
    })
    const data:UpdateTest=req.body
    try{
        const result=await updateTestDetails(test_id,data,student_id)
        return res.status(200).json({
            result
        })
    }catch(error:any){
        return res.status(500).json({
            "status":"Failed",
            "error":""+error.message
        })
    }   
}

export async function fetchTestByOwner(req:Request,res:Response){
    const student_id=req.user?.id
    if(!student_id){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authentication Failed"
        })
    }
    try{
        const result=await fetchTestsByOwnership(student_id)
         return res.status(200).json({
            result
        })
        
    }catch(error:any){
        return res.status(500).json({
            "status":"Failed",
            "error":""+error.message
        })
    }
}

export async function fetchCustomTestsByID(req:Request,res:Response){
    const student_id=req.user?.id
    if(!student_id){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authentication Failed"
        })
    }
    const test_id=Number(req.params.test_id)
    if(!Number.isInteger(test_id) || test_id<=0)
        return res.status(500).json({
            "status":"Failed",
            "error":"Invalid Test ID"
    })

    try{
        const result=await fetchTestsByID(test_id,student_id)
        return res.status(200).json({
            result
        })
    }catch(error:any){
        return res.status(500).json({
            "status":"Failed",
            "error":""+error.message
        })
    }
}

export async function publish(req:Request,res:Response){
    const student_id=req.user?.id
    if(!student_id){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authentication Failed"
        })
    }
    const test_id=Number(req.params.test_id)
    if(!Number.isInteger(test_id) || test_id<=0)
        return res.status(500).json({
            "status":"Failed",
            "error":"Invalid Test ID"
    })

    try{
        const result=await publishTest(test_id,student_id)
        return res.status(200).json({
            result
        })
    }catch(error:any){
        return res.status(500).json({
            "status":"Failed",
            "error":""+error.message
        })
    }
}

export async function unPublish(req:Request,res:Response){
    const student_id=req.user?.id
    if(!student_id){
        return res.status(400).json({
            "status":"Failed",
            "error":"Authentication Failed"
        })
    }
    const test_id=Number(req.params.test_id)
    if(!Number.isInteger(test_id) || test_id<=0)
        return res.status(500).json({
            "status":"Failed",
            "error":"Invalid Test ID"
    })

    try{
        const result=await unPublishTest(test_id,student_id)
        return res.status(200).json({
            result
        })
    }catch(error:any){
        return res.status(500).json({
            "status":"Failed",
            "error":""+error.message
        })
    }
}