import { Router } from "express";
import express from "express"
import { authenticate } from "../middleware/autenticate.js";
import { create, fetchAll, fetchById, fetchTestDetails, fetchTestQuestion, publish, PublishedTests, remove, updateTest } from "../controllers/ContestController.js";
const router=express.Router()
router.use(authenticate);
router.get("/fetch/:id",fetchById)
router.get("/published",PublishedTests)
router.get("/details/:id",fetchTestDetails)
router.get("/fetch/question/:id",fetchTestQuestion)
export default router