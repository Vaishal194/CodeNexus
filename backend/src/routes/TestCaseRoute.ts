import { Router } from "express";
import express from "express"
import { addCase, getAllTestCasesById, getHiddenCasesById, getTestCasesById, removeCase } from "../controllers/TestCaseController.js";
import { getTestCases } from "../services/TestCasesService.js";
import { authenticate } from "../middleware/autenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
const router=express.Router()
router.use(authenticate)
// router.post("/add",addCase)
// router.get("/remove/:id",removeCase)
// router.get("/hidden/:id",getHiddenCasesById)
router.get("/:id",getTestCasesById)
//router.get("/all/:id",getAllTestCasesById)
export default router