import { Request, Response } from "express";
import {
    CustomTestQuestionError,
    addCustomTestCoding,
    addCustomTestMcq,
    linkProblemToCustomTest,
    removeQuestionFromCustomTest,
} from "../services/CustomTestQuestionService.js";
import {
    customTestCodingPayload,
    customTestMcqPayload,
} from "../interfaces/CustomTestQuestion.js";

function parseId(value: unknown): number | null {
    const raw = Array.isArray(value) ? value[0] : value;
    const numeric = Number(raw);
    return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

function handleError(res: Response, error: unknown) {
    if (error instanceof CustomTestQuestionError) {
        return res.status(error.statusCode).json({
            status: "Failed",
            error: error.message,
        });
    }

    const message = error instanceof Error ? error.message : "Internal Server Error";

    return res.status(500).json({
        status: "Failed",
        error: message,
    });
}

export async function addCustomMcqQuestion(req: Request, res: Response) {
    const studentId = req.user?.id;
    const testId = parseId(req.params.test_id);

    if (!studentId) {
        return res.status(401).json({
            status: "Failed",
            error: "Authentication required",
        });
    }

    if (testId === null) {
        return res.status(400).json({
            status: "Failed",
            error: "A valid test ID is required",
        });
    }

    try {
        const result = await addCustomTestMcq(
            testId,
            studentId,
            (req.body ?? {}) as customTestMcqPayload
        );

        return res.status(201).json({
            status: "MCQ question added",
            result,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function addCustomCodingQuestion(req: Request, res: Response) {
    const studentId = req.user?.id;
    const testId = parseId(req.params.test_id);

    if (!studentId) {
        return res.status(401).json({
            status: "Failed",
            error: "Authentication required",
        });
    }

    if (testId === null) {
        return res.status(400).json({
            status: "Failed",
            error: "A valid test ID is required",
        });
    }

    try {
        const result = await addCustomTestCoding(
            testId,
            studentId,
            (req.body ?? {}) as customTestCodingPayload
        );

        return res.status(201).json({
            status: "Coding question added",
            result,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function linkCustomProblem(req: Request, res: Response) {
    const studentId = req.user?.id;
    const body = (req.body ?? {}) as Record<string, unknown>;
    const testId = parseId(req.params.test_id);
    const problemId = parseId(
        typeof body.problem_id === "string"
            ? body.problem_id
            : String(body.problem_id ?? "")
    );
    const marks = Number(body.marks);

    if (!studentId) {
        return res.status(401).json({
            status: "Failed",
            error: "Authentication required",
        });
    }

    if (testId === null) {
        return res.status(400).json({
            status: "Failed",
            error: "A valid test ID is required",
        });
    }

    if (problemId === null) {
        return res.status(400).json({
            status: "Failed",
            error: "A valid problem ID is required",
        });
    }

    try {
        const result = await linkProblemToCustomTest(
            testId,
            studentId,
            problemId,
            marks
        );

        return res.status(201).json({
            status: "Problem linked",
            result,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function removeCustomQuestion(req: Request, res: Response) {
    const studentId = req.user?.id;
    const testId = parseId(req.params.test_id);
    const testQuestionId = parseId(req.params.test_question_id);

    if (!studentId) {
        return res.status(401).json({
            status: "Failed",
            error: "Authentication required",
        });
    }

    if (testId === null || testQuestionId === null) {
        return res.status(400).json({
            status: "Failed",
            error: "Valid test and question IDs are required",
        });
    }

    try {
        const result = await removeQuestionFromCustomTest(
            testId,
            studentId,
            testQuestionId
        );

        return res.status(200).json({
            status: "Question removed",
            result,
        });
    } catch (error) {
        return handleError(res, error);
    }
}
