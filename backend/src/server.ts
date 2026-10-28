import express from "express"
import cors from "cors"
import {Request,Response} from "express"
import ExecutionRoute from "../src/routes/ExecutionRoute.js"
import ProblemRoutes from "../src/routes/ProblemRoutes.js"
import TestCaseRoute from "../src/routes/TestCaseRoute.js"
import ContestRoute from "../src/routes/ContestRoute.js"
import MCQRoutes from "../src/routes/MCQRoutes.js"
import TestQuestionRoute from "../src/routes/TestQuestionRoute.js"
import TestAttemptRoute from "../src/routes/TestAttemptRoutes.js"
import AttemptAnswerRoute from "../src/routes/AttemptAnswerRoute.js"
import CodeSubmissionRoute from "../src/routes/CodeSubmissionRoute.js"
const app=express()
const port = 5000
app.use(cors())
app.use(express.json())

app.get("/",(req:Request,res:Response)=>{
    res.send("Backend Running Properly")
})

app.use("/api",ExecutionRoute)
app.use("/prob",ProblemRoutes)
app.use("/testcase",TestCaseRoute)
app.use("/contest",ContestRoute)
app.use("/question",TestQuestionRoute)
app.use("/Mcq",MCQRoutes)
app.use("/attempts", TestAttemptRoute);
app.use("/attempt",AttemptAnswerRoute)
app.use("/submit-code",CodeSubmissionRoute)
app.listen(port,()=>{
    console.log(`Using Port: ${port}`)
})