import express from "express"
import { getResult } from "../controllers/TestResultController.js"

const router=express.Router()
router.get("/:attemptId/result",getResult)
export default router