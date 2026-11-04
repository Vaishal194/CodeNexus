import express from "express"
import { addMCQ, removeMCQ } from "../controllers/MCQController.js"
import { authenticate } from "../middleware/autenticate.js"
import { requireAdmin } from "../middleware/requireAdmin.js"
const router=express.Router()
router.use(authenticate,requireAdmin)
router.post("/add",addMCQ)
router.delete("/remove/:id",removeMCQ)
export default router