import {writeFile,rm} from "fs/promises"
import { ExecutionResult } from "../interfaces/ExecutionResult.js"
import {execFile} from "child_process"
import { promisify } from "util"

export default async function(code:string,input:string):Promise<ExecutionResult>{
    const srcFile="main.py"
    const execPromise = promisify(execFile)
    writeFile(srcFile,code)
    try{
        const {stdout,stderr}=await execPromise("python",[srcFile],
            {timeout:5000}
        )
        if(stdout){
            if(input==stdout.trim()){
                return {
                    "output":stdout,
                    "status":"Accepted"
                }
            }else{
                return{
                    "output":stdout,
                    "status":"Wrong Answer"
                }
            }
        }
    }catch(error:any){
        if(error.killed){
            return{
                "status":"Time Limit Exceeded",
                "output":"Time Limit Execeeded"
            }
        }
        else return{
            "status":"Wrong Answer",
            "output":error.message
        }
    }finally{
        await rm(srcFile,{force:true})
    }
    return{
        "status":"Time Limit Exceeded",
        "output":" "
    }
}