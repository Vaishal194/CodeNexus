import { CppRunner } from "../runners/CppRunner.js";
import JavaRunner from "../runners/javaRunner.js";
import PythonRunner from "../runners/pythonRunner.js";
import { generateAllTestCases, generateNonHiddenTestCases } from "./TestCasesService.js";
import { RunnerOptions } from "../interfaces/JudgeResult.js";
import {pool} from "../database.js"

export default async function executeCode(
    problemId: number,
    lang: string,
    code: string,
    options: RunnerOptions = {}
) {
    const testCases = await generateAllTestCases(problemId);

    if (testCases.length === 0) {
        throw new Error("No test cases found for this problem");
    }

    const cases = testCases.map((tc: any) => ({
        input: tc.input,
        expected_output: tc.expected_output,
        is_hidden: tc.is_hidden
    }));

    const language = lang.toLowerCase();

    if (language === "cpp" || language === "c++") {
        return CppRunner(code, cases, options);
    }

    if (language === "python" || language === "py") {
        return PythonRunner(code, cases, options);
    }

    if (language === "java") {
        return JavaRunner(code, cases, options);
    }

    throw new Error(`Unsupported language: ${lang}`);
}

export async function runCode(problem_id: number,
    lang: string,
    code: string){
        const testCases=await generateNonHiddenTestCases(problem_id);
        const cases = testCases.map((tc: any) => ({
        input: tc.input,
        expected_output: tc.expected_output,
        is_hidden: tc.is_hidden
    }));

    const language = lang.toLowerCase();

    if (language === "cpp" || language === "c++") {
        return CppRunner(code, cases, { includeTestCaseDetails: true });
    }

    if (language === "python" || language === "py") {
        return PythonRunner(code, cases, { includeTestCaseDetails: true });
    }

    if (language === "java") {
        return JavaRunner(code, cases, { includeTestCaseDetails: true });
    }

    throw new Error(`Unsupported language: ${lang}`);
}

export async function getStudentHistory(student_id:string){
    const query=`SELECT *FROM problem_submissions WHERE student_id=$1`
    const result=await pool.query(query,[student_id])
    return result.rows
}