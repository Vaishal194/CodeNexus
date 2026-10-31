
import type { Request, Response } from "express";
import { getAttemptResult } from "../services/TestResultService.js";

export async function getResult(req: Request, res: Response) {
    try {
        const attemptId = Number(req.params.attemptId);

        if (!Number.isInteger(attemptId) || attemptId <= 0) {
            return res.status(400).json({
                status: "Failed",
                error: "A valid attempt ID is required"
            });
        }

        const result = await getAttemptResult(attemptId);

        return res.status(200).json({
            status: "success",
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
            error.message ===
            "Results are not available until the attempt is submitted"
        ) {
            return res.status(409).json({
                status: "Failed",
                error: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "Failed",
            error: "Internal server error"
        });
    }
}
