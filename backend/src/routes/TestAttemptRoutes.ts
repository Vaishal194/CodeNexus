import express from "express";
import {authenticate} from "../middleware/autenticate.js"
import {
    startTestAttempt,
    fetchTestAttempt,
    submit
} from "../controllers/TestAttemptController.js";

const router = express.Router();

router.post("/start",authenticate,startTestAttempt);
router.get("/:attemptId", authenticate,fetchTestAttempt);
router.post("/:attemptId/submit",authenticate,submit)
export default router;