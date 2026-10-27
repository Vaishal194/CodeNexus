
import { writeFile, readFile, rm, mkdtemp } from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import path from "path";
import { randomUUID } from "crypto";
import { ExecutionResult } from "../interfaces/ExecutionResult.js";
import { JudgeCase } from "../interfaces/JudgeCase.js";
const execPromise = promisify(execFile);
const IMAGE = "prepverse-cpp-test";

interface CaseResult {
    testCase: number;
    status: "Passed" | "Failed" | "Runtime Error" | "Time Limit Exceeded";
    output?: string;
}

export async function CppRunner(
    code: string,
    testCases: JudgeCase[]
): Promise<ExecutionResult> {
    if (testCases.length === 0) {
        return {
            status: "Runtime Error",
            output: "",
            error: "No test cases found for this problem."
        };
    }

    const dir = await mkdtemp(path.join(tmpdir(), "prepverse-"));
    const sourceDir = path.join(dir, "source");
    const resultDir = path.join(dir, "results");
    const containerName = `prepverse-${randomUUID()}`;

    const fs = await import("fs/promises");

    try {
        await fs.mkdir(sourceDir);
        await fs.mkdir(resultDir);

        await writeFile(path.join(sourceDir, "main.cpp"), code);

        for (let i = 0; i < testCases.length; i++) {
            await writeFile(
                path.join(sourceDir, `input-${i}.txt`),
                testCases[i].input
            );
        }

        const commands = [
            "g++ -std=c++17 /src/main.cpp -o /results/main 2>/results/compile_error.txt || exit 20",
            ...testCases.map((_, i) =>
                `timeout 5s /results/main < /src/input-${i}.txt > /results/output-${i}.txt 2>/results/error-${i}.txt; echo $? > /results/status-${i}.txt`
            )
        ].join("\n");

        try {
            await execPromise(
                "docker",
                [
                    "run",
                    "--name", containerName,
                    "--rm",
                    "--network", "none",
                    "--memory", "128m",
                    "--cpus", "0.5",
                    "--pids-limit", "64",
                    "--mount",
                    `type=bind,source=${sourceDir},target=/src,readonly`,
                    "--mount",
                    `type=bind,source=${resultDir},target=/results`,
                    "--workdir", "/src",
                    IMAGE,
                    "sh",
                    "-c",
                    commands
                ],
                {
                    timeout: 15000,
                    maxBuffer: 1024 * 1024
                }
            );
        } catch (error: any) {
            if (error.code === 20) {
                const compileError = await readFile(
                    path.join(resultDir, "compile_error.txt"),
                    "utf8"
                ).catch(() => "Compilation failed.");

                return {
                    status: "Compilation Error",
                    output: "",
                    error: compileError
                };
            }

            if (error.killed || error.signal === "SIGTERM") {
                return {
                    status: "Time Limit Exceeded",
                    output: "",
                    error: "The overall execution time limit was exceeded."
                };
            }

            return {
                status: "Runtime Error",
                output: "",
                error: String(error.stderr || error.message)
            };
        }

        const results: CaseResult[] = [];

        for (let i = 0; i < testCases.length; i++) {
            const actual = await readFile(
                path.join(resultDir, `output-${i}.txt`),
                "utf8"
            ).catch(() => "");

            const errorOutput = await readFile(
                path.join(resultDir, `error-${i}.txt`),
                "utf8"
            ).catch(() => "");

            const exitCode = Number(
                await readFile(
                    path.join(resultDir, `status-${i}.txt`),
                    "utf8"
                ).catch(() => "-1")
            );

            if (exitCode === 124) {
                results.push({
                    testCase: i + 1,
                    status: "Time Limit Exceeded"
                });
            } else if (exitCode !== 0) {
                results.push({
                    testCase: i + 1,
                    status: "Runtime Error"
                });
            } else if (
                actual.trim() === testCases[i].expected_output.trim()
            ) {
                results.push({
                    testCase: i + 1,
                    status: "Passed"
                });
            } else {
                results.push({
                    testCase: i + 1,
                    status: "Failed"
                });
            }
        }

        const failedCase = results.find(r => r.status !== "Passed");
        const passedCount = results.filter(r => r.status === "Passed").length;

        return {
            status: passedCount === testCases.length
                ? "Accepted"
                : failedCase?.status === "Time Limit Exceeded"
                    ? "Time Limit Exceeded"
                    : failedCase?.status === "Runtime Error"
                        ? "Runtime Error"
                        : "Wrong Answer",
            output: JSON.stringify({
                passed: passedCount,
                total: testCases.length,
                testCases: results
            })
        };
    } finally {
        try {
            await execPromise("docker", ["rm", "-f", containerName], {
                timeout: 5000
            });
        } catch {
        }

        await rm(dir, { recursive: true, force: true });
    }
}
