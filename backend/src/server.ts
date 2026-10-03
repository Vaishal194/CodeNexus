import express from "express"
import cors from "cors"
import {Request,Response} from "express"

const app=express()
const port=3000

app.use(cors())
app.get("/",(req:Request,res:Response)=>{
    res.send("Backend Running Properly")
})

app.listen(port,()=>{
    console.log(`Running in the Port ${port}`)
})