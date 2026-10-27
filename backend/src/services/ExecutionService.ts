import { CppRunner } from "../runners/CppRunner.js";
import JavaRunner from "../runners/javaRunner.js";
import PythonRunner from "../runners/pythonRunner.js";
import { generateAllTestCases } from "./TestCasesService.js";

export default async function (
    problemId: number,
    lang: string,
    code: string
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
        return CppRunner(code, cases);
    }

    if (language === "python" || language === "py") {
        return PythonRunner(code, cases);
    }

    if (language === "java") {
        return JavaRunner(code, cases);
    }

    throw new Error(`Unsupported language: ${lang}`);
}