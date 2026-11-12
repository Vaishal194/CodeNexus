import {CheckIsDisqualified, violated} from "../controllers/TestViolationController.js"
import express from "express"
import { authenticate } from "../middleware/autenticate.js"
const router=express.Router()
router.use(authenticate)
router.post("/:attemptId/:testId",violated)
router.get("/:attemptId/:testId/disqualified",CheckIsDisqualified)
export default router