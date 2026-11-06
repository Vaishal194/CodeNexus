
import { writeFile, readFile, rm, mkdtemp, mkdir } from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import path from "path";
import { randomUUID } from "crypto";
import { ExecutionResult } from "../interfaces/ExecutionResult.js";
import { JudgeCaseResult, RunnerOptions } from "../interfaces/JudgeResult.js";

const execPromise = promisify(execFile);
const IMAGE = "prepverse-java";

interface JudgeCase {
    input: string;
    expected_output: string;
    is_hidden?: boolean;
}

export async function JavaRunner(
    code: string,
    testCases: JudgeCase[],
    options: RunnerOptions = {}
): Promise<ExecutionResult> {
    if (testCases.length === 0) {
        return {
            status: "Runtime Error",
            output: "",
            error: "No test cases found."
        };
    }

    const dir = await mkdtemp(path.join(tmpdir(), "prepverse-java-"));
    const sourceDir = path.join(dir, "source");
    const resultDir = path.join(dir, "results");
    const containerName = `prepverse-java-${randomUUID()}`;

    try {
        await mkdir(sourceDir);
        await mkdir(resultDir);

        await writeFile(path.join(sourceDir, "Main.java"), code);

        for (let i = 0; i < testCases.length; i++) {
            await writeFile(
                path.join(sourceDir, `input-${i}.txt`),
                testCases[i].input
            );
        }

        // Compile once using Java 25, then run each test separately.
        const commands = [
            "javac -d /results /src/Main.java 2>/results/compile_error.txt || exit 20",
            ...testCases.map((_, i) =>
                `timeout 5s java -cp /results Main < /src/input-${i}.txt > /results/output-${i}.txt 2>/results/error-${i}.txt; echo $? > /results/status-${i}.txt`
            )
        ].join("\n");

        try {
            await execPromise("docker", [
                "run",
                "--name", containerName,
                "--rm",
                "--network", "none",
                "--memory", "256m",
                "--cpus", "0.5",
                "--pids-limit", "64",
                "--mount",
                `type=bind,source=${sourceDir},target=/src,readonly`,
                "--mount",
                `type=bind,source=${resultDir},target=/results`,
                "--workdir", "/src",
                IMAGE,
                "sh", "-c", commands
            ], {
                // Overall safety limit; individual tests still have 5 seconds.
                timeout: 60000,
                maxBuffer: 1024 * 1024
            });
        } catch (error: any) {
            if (error.code === 20) {
                const compileError = await readFile(
                    path.join(resultDir, "compile_error.txt"),
                    "utf8"
                ).catch(() => "Java compilation failed.");

                return {
                    status: "Compilation Error",
                    output: "",
                    error: compileError
                };
            }

            if (
                error.killed ||
                error.code === "ETIMEDOUT" ||
                error.signal === "SIGTERM"
            ) {
                return {
                    status: "Time Limit Exceeded",
                    output: "",
                    error: "Overall execution timed out."
                };
            }

            return {
                status: "Runtime Error",
                output: "",
                error: String(error.stderr || error.message)
            };
        }

        const results: JudgeCaseResult[] = [];

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

            let status: JudgeCaseResult["status"];

            if (exitCode === 124) {
                status = "Time Limit Exceeded";
            } else if (exitCode !== 0) {
                status = "Runtime Error";
            } else if (
                actual.trim() === testCases[i].expected_output.trim()
            ) {
                status = "Passed";
            } else {
                status = "Failed";
            }

            const caseResult: JudgeCaseResult = {
                testCase: i + 1,
                status,
                passed: status === "Passed"
            };

            if (options.includeTestCaseDetails && !testCases[i].is_hidden) {
                caseResult.input = testCases[i].input;
                caseResult.expected_output = testCases[i].expected_output;
                caseResult.actual_output = actual;

                if (errorOutput.trim()) {
                    caseResult.error = errorOutput.trim();
                }
            }

            results.push(caseResult);
        }

        const passed = results.filter(
            result => result.status === "Passed"
        ).length;

        const failed = results.find(
            result => result.status !== "Passed"
        );

        return {
            status:
                passed === testCases.length
                    ? "Accepted"
                    : failed?.status === "Time Limit Exceeded"
                        ? "Time Limit Exceeded"
                        : failed?.status === "Runtime Error"
                            ? "Runtime Error"
                            : "Wrong Answer",
            output: JSON.stringify({
                passed,
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
            // Container may already have been removed.
        }

        await rm(dir, { recursive: true, force: true });
    }
}

export default JavaRunner;
