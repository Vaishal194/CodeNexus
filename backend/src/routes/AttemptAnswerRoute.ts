import express from "express"
import { saveAnswer } from "../controllers/AttemptAnswerController.js";
import {authenticate} from "../middleware/autenticate.js"
const router=express.Router()
router.post("/:attemptId/answers",authenticate,saveAnswer);
export default router