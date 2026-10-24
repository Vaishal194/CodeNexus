import express from "express"
import { addMCQ, removeMCQ } from "../controllers/MCQController.js"
const router=express.Router()

router.post("/add",addMCQ)
router.get("/remove/:id",removeMCQ)
export default router