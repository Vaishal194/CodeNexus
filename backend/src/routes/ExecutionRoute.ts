import executeCode, { getHistory, runCodeControl, submitCode } from "../controllers/ExecutionController.js";
import { Router } from "express";
import express from "express"
import { authenticate } from "../middleware/autenticate.js";

const router=express.Router()

router.use(authenticate)
router.post("/submitCode",submitCode)
router.post("/execute",executeCode)
router.post("/run",runCodeControl)
router.get("/history",getHistory)
export default router