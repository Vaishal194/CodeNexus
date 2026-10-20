import { postProblem } from "../controllers/ProblemController.js"
import express from "express"

const router=express.Router()
router.post("/problem",postProblem)
export default router