import { Router } from "express";
import express from "express"
import { addCase, getAllTestCasesById, getHiddenCasesById, getTestCasesById, removeCase } from "../controllers/TestCaseController.js";
import { getTestCases } from "../services/TestCasesService.js";

const router=express.Router()
router.post("/add",addCase)
router.get("/remove/:id",removeCase)
router.get("/hidden/:id",getHiddenCasesById)
router.get("/:id",getTestCasesById)
router.get("/all/:id",getAllTestCasesById)
export default router