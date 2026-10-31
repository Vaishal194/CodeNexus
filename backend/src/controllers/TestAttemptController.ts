import { Request, Response } from "express";
import {
    startAttempt,
    getAttempt,
    submitAttempt
} from "../services/TestAttemptService.js";

export async function startTestAttempt(req: Request, res: Response) {
    const testId = Number(req.body.test_id);
    const studentId = req.user?.id;

    if (!Number.isInteger(testId) || testId <= 0) {
        return res.status(400).json({
            status: "Failed",
            error: "A valid test_id is required"
        });
    }

    if (!studentId) {
        return res.status(401).json({
            status: "Failed",
            error: "Authentication required"
        });
    }

    try {
        const result = await startAttempt(testId, studentId);

        return res.status(201).json({
            status: "Test attempt started",
            data: result
        });
    } catch (error: any) {
        if (error.code === "23503") {
            return res.status(400).json({
                status: "Failed",
                error: "Invalid test reference"
            });
        }

        if (
            error.message === "Test not found or not published" ||
            error.message === "You have already started or attempted this test"
        ) {
            return res.status(409).json({
                status: "Failed",
                error: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "Failed to start test attempt",
            error: "Internal server error"
        });
    }
}

export async function fetchTestAttempt(req: Request, res: Response) {
    const attemptId = Number(req.params.attemptId);
    const studentId = req.user?.id;

    if (!Number.isInteger(attemptId) || attemptId <= 0) {
        return res.status(400).json({
            status: "Failed",
            error: "Invalid attempt ID"
        });
    }

    if (!studentId) {
        return res.status(401).json({
            status: "Failed",
            error: "Authentication required"
        });
    }

    try {
        const result = await getAttempt(attemptId, studentId);

        return res.status(200).json({
            status: "Attempt fetched successfully",
            data: result
        });
    } catch (error: any) {
        if (error.message === "Attempt not found") {
            return res.status(404).json({
                status: "Failed",
                error: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "Failed to fetch attempt",
            error: "Internal server error"
        });
    }
}

export async function submit(req: Request, res: Response) {
    const attemptId = Number(req.params.attemptId);
    const studentId = req.user?.id;

    if (!Number.isInteger(attemptId) || attemptId <= 0) {
        return res.status(400).json({
            status: "Failed",
            error: "Invalid attempt ID"
        });
    }

    if (!studentId) {
        return res.status(401).json({
            status: "Failed",
            error: "Authentication required"
        });
    }

    try {
        const result = await submitAttempt(attemptId, studentId);

        return res.status(200).json({
            status: "Success",
            message: "Test submitted successfully",
            result
        });
    } catch (error: any) {
        if (error.message === "Attempt not found") {
            return res.status(404).json({
                status: "Failed",
                error: error.message
            });
        }

        if (
            error.message === "Attempt has already been submitted or is not active" ||
            error.message === "Code execution is still running. Please wait."
        ) {
            return res.status(409).json({
                status: "Failed",
                error: error.message
            });
        }

        console.error("Submit test error:", error);

        return res.status(500).json({
            status: "Failed",
            error: "Internal server error"
        });
    }
}