import { Router } from "express";
import express from "express"
import { create, fetchAll, fetchById, publish, remove } from "../controllers/ContestController.js";
const router=express.Router()

router.post("/create",create)
router.post("/remove/:id",remove)
router.post("/publish",publish)
router.get("/fetch",fetchAll)
router.get("/fetch/:id",fetchById)
export default router