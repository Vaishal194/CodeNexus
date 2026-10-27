
import { writeFile, rm, mkdtemp } from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import path from "path";
import { randomUUID } from "crypto";
import { ExecutionResult } from "../interfaces/ExecutionResult.js";

const execPromise = promisify(execFile);
const IMAGE = "prepverse-cpp-test";

export default async function (
    code: string,
    input: string,
    expectedOutput: string
): Promise<ExecutionResult> {
    const dir = await mkdtemp(path.join(tmpdir(), "prepverse-"));
    const containerName = `prepverse-${randomUUID()}`;

    try {
        await writeFile(path.join(dir, "main.cpp"), code);
        await writeFile(path.join(dir, "input.txt"), input);

        // Compile and execute inside Docker.
        const { stdout } = await execPromise(
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
                `type=bind,source=${dir},target=/src,readonly`,
                "--workdir", "/src",
                IMAGE,
                "sh",
                "-c",
                "g++ -std=c++17 /src/main.cpp -o /tmp/main && timeout 5s /tmp/main < /src/input.txt"
            ],
            {
                timeout: 10000,
                maxBuffer: 1024 * 1024
            }
        );

        const actual = stdout.trim();
        const expected = expectedOutput.trim();

        return {
            status: actual === expected ? "Accepted" : "Wrong Answer",
            output: stdout
        };
    } catch (error: any) {
        const stderr = String(error.stderr ?? "");
        const stdout = String(error.stdout ?? "");

        if (error.killed || error.signal === "SIGTERM") {
            return {
                status: "Time Limit Exceeded",
                output: stdout,
                error: "Execution timed out"
            };
        }

        return {
            status: stderr ? "Compilation Error" : "Runtime Error",
            output: stdout,
            error: stderr || error.message
        };
    } finally {
        // Remove any remaining container and temporary files.
        try {
            await execPromise("docker", ["rm", "-f", containerName], {
                timeout: 5000
            });
        } catch {
            // The container may already have been removed.
        }

        await rm(dir, { recursive: true, force: true });
    }
}
