import express from "express"
import { getResult } from "../controllers/TestResultController.js"
import { authenticate } from "../middleware/autenticate.js"
import { requireAdmin } from "../middleware/requireAdmin.js"
const router=express.Router()
router.get("/:attemptId/result",authenticate,getResult)
export default router