import { writeFile, rm } from "fs/promises"
import { execFile } from 'child_process'
import { promisify } from "util"
import { ExecutionResult } from "../interfaces/ExecutionResult.js"
import { stderr } from "process"
const execPromise = promisify(execFile)
const srcFile = 'main.cpp'
const exeFile = 'main.exe'

export default async function (code: string, input: string): Promise<ExecutionResult> {
    writeFile(srcFile, code)
    try {
        await execPromise('g++', [srcFile, '-o', exeFile], { timeout: 10000 })
        const { stdout, stderr } = await execPromise(`${exeFile}`, [], { timeout: 5000 })
        if (stdout) {
            if (input == stdout.trim()) {
                return {
                    "status": "Accepted",
                    'output': stdout
                }
            }
            return {
                "status": "Wrong Answer",
                "output": stdout
            }
        }
    } catch (error: any) {
        if (error.killed)
            return {
                "output": error.stdout ?? "",
                "error": error.killed
                    ? "Time Limit Exceeded"
                    : error.stderr || error.message,
                "status": "Time Limit Exceeded"
            };
        else{
            return{
                "status":"Wrong Answer",
                "output":error.message
            }
        }
    }
    finally {
        await rm(srcFile, { force: true })
        await rm(exeFile, { force: true })
    }
    return {
        "status": "Wrong Answer",
        "output": " ",
    }
}