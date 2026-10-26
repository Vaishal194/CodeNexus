import express from "express";
import {
    startTestAttempt,
    fetchTestAttempt,
    submit
} from "../controllers/TestAttemptController.js";

const router = express.Router();

router.post("/start", startTestAttempt);
router.get("/:attemptId", fetchTestAttempt);
router.post("/:attemptId/submit",submit)
export default router;