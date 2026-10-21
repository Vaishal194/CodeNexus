import { postProblem ,getProblem, fetchProblemList} from "../controllers/ProblemController.js"
import express from "express"

const router=express.Router()
router.post("/problems/create",postProblem)
router.get("/problems/:id",getProblem)
router.get("/problems",fetchProblemList)
export default router