import ExecutionService from "../services/ExecutionService.js";
import { Request,Response } from "express";

async function executeCode(req:Request,res:Response){
    const {language,code,input}=req.body
        const result=await ExecutionService(language,code,input)
        res.json(result)
}
export default executeCode
