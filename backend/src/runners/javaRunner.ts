import {writeFile,rm} from "fs/promises"
import {execFile} from 'child_process'
import { promisify } from "util"
import { ExecutionResult } from "../interfaces/ExecutionResult.js"
const execPromise=promisify(execFile)
const srcFile='Main.java'
const byteFile='Main'
export default async function(code:string,input:string):Promise<ExecutionResult>{
    writeFile(srcFile,code)
    try{
        await execPromise('javac',[srcFile],{timeout:10000})
        const {stdout,stderr}=await execPromise('java',[byteFile],{timeout:5000})
       if(stdout){
            if(input==stdout.trim()){
                return{
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
            return {
                "output":"Time Limit Exceeded",
                "status":"Time Limit Exceeded"
            }
        }
        return {
            "status":"Wrong Answer",
            "error":error.message
        }
    }
    finally{
        await rm(srcFile,{force:true})
        await rm(byteFile+".class",{force:true})
    }
    return{
        "output":"",
        "status":"Wrong Answer"
    }
}