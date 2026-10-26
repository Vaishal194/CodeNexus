import { Request, Response } from "express";
import { saveMCQAnswer } from "../services/AttemptAnswerService.js";

export async function saveAnswer(req: Request, res: Response) {
    const attemptId = Number(req.params.attemptId);
    const { test_question_id, selected_option } = req.body;

    if (
        !Number.isInteger(attemptId) ||
        attemptId <= 0 ||
        !Number.isInteger(test_question_id) ||
        test_question_id <= 0 ||
        !Number.isInteger(selected_option) ||
        selected_option < 0
    ) {
        return res.status(400).json({
            status: "Failed",
            error: "Invalid attempt ID, question ID, or option index"
        });
    }

    try {
        const result = await saveMCQAnswer(
            attemptId,
            test_question_id,
            selected_option
        );

        return res.status(200).json({
            status: "Answer saved successfully",
            data: result
        });
    } catch (error: any) {
        if (
            error.message === "Attempt not found or already submitted" ||
            error.message === "MCQ question not found in this test" ||
            error.message === "Invalid option index"
        ) {
            return res.status(400).json({
                status: "Failed",
                error: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "Failed to save answer",
            error: "Internal server error"
        });
    }
}