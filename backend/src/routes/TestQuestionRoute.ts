import express from "express"
import { Router } from "express"
import { addQuestion, deleteQuestion, fetchAllQuestions, fetchTestQuestionById } from "../controllers/TestQuestionController.js"
import { authenticate } from "../middleware/autenticate.js"
import { requireAdmin } from "../middleware/requireAdmin.js"
const router=express.Router()
router.use(authenticate,requireAdmin)

router.post("/add",addQuestion)
router.get("/remove/:id",deleteQuestion)
router.get("/fetch/:id",fetchTestQuestionById)
router.get("/fetch",fetchAllQuestions)
export default router