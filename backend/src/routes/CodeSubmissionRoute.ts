import express from "express"
import { submit } from "../controllers/CodeSubmissionController.js"
import { authenticate } from "../middleware/autenticate.js"
const router=express.Router()
router.post("/submit",authenticate,submit)
export default router