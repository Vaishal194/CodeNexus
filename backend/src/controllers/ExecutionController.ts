import ExecutionService from "../services/ExecutionService.js";
import { Request,Response } from "express";

async function executeCode(req:Request,res:Response){
    const {problem_id,language,code}=req.body
    try{

        const result=await ExecutionService(Number(problem_id),language,code)
        res.status(200).json(
            result
        )
    }catch(error:any){
        console.error("Execution error:", error);

        return res.status(500).json({
            status: "Failed",
            error: error.message
        });
    }
        
}
export default executeCode
