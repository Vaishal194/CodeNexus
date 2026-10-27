export interface ExecutionResult{
    "output"?:string,
    "error"?:string,
    "status":"Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Memory Limited Exceeded" | "Compilation Error" | "Runtime Error"
}