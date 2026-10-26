import express from "express"
import { saveAnswer } from "../controllers/AttemptAnswerController.js";
const router=express.Router()
router.post("/:attemptId/answers", saveAnswer);
export default router