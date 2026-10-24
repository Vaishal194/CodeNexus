import { Router } from "express";
import express from "express"
import { create, fetchAll, fetchById, fetchTestDetails, fetchTestQuestion, publish, PublishedTests, remove } from "../controllers/ContestController.js";
const router=express.Router()

router.post("/create",create)
router.post("/remove/:id",remove)
router.post("/publish",publish)
router.get("/fetch",fetchAll)
router.get("/fetch/:id",fetchById)
router.get("/published",PublishedTests)
router.get("/details/:id",fetchTestDetails)
router.get("/fetch/question/:id",fetchTestQuestion)
export default router