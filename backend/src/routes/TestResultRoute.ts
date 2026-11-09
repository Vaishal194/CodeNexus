import express from "express"
import { getResult,getResultAdmin } from "../controllers/TestResultController.js"
import { authenticate } from "../middleware/autenticate.js"
import { requireAdmin } from "../middleware/requireAdmin.js"
const router=express.Router()
router.get("/:attemptId/result",authenticate,getResult)
router.get("/:attemptId/:studentId/result",authenticate,requireAdmin,getResultAdmin)
export default router