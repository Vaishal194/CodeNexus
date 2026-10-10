import executeCode from "../controllers/ExecutionController.js";
import { Router } from "express";
import express from "express"

const router=express.Router()
router.post("/execute",executeCode)

export default router