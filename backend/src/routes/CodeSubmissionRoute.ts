import express from "express"
import { submit } from "../controllers/CodeSubmissionController.js"
const router=express.Router()
router.post("/submit",submit)
export default router