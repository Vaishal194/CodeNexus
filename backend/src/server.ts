import express from "express"
import cors from "cors"
import {Request,Response} from "express"
import ExecutionRoute from "../src/routes/ExecutionRoute.js"
import ProblemRoutes from "../src/routes/ProblemRoutes.js"
const app=express()
const port = 5000
app.use(cors())
app.use(express.json())

app.get("/",(req:Request,res:Response)=>{
    res.send("Backend Running Properly")
})

app.use("/api",ExecutionRoute)
app.use("/prob",ProblemRoutes)

app.listen(port,()=>{
    console.log(`Using Port: ${port}`)
})