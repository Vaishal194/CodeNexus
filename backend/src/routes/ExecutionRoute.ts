import executeCode from "../controllers/ExecutionController.js";
import { Router } from "express";
import express from "express"
import { authenticate } from "../middleware/autenticate.js";
const router=express.Router()
router.use(authenticate)
router.post("/execute",executeCode)
export default router