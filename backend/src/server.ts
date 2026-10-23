import express from "express"
import cors from "cors"
import {Request,Response} from "express"
import ExecutionRoute from "../src/routes/ExecutionRoute.js"
import ProblemRoutes from "../src/routes/ProblemRoutes.js"
import TestCaseRoute from "../src/routes/TestCaseRoute.js"
import ContestRoute from "../src/routes/ContestRoute.js"
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
app.listen(port,()=>{
    console.log(`Using Port: ${port}`)
})