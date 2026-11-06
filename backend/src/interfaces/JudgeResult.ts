export type JudgeCaseStatus =
    | "Passed"
    | "Failed"
    | "Runtime Error"
    | "Time Limit Exceeded";

export interface JudgeCaseResult {
    testCase: number;
    status: JudgeCaseStatus;
    passed: boolean;

    // Only populated for non-hidden cases when includeTestCaseDetails is true.
    input?: string;
    expected_output?: string;
    actual_output?: string;
    error?: string;
}

export interface RunnerOptions {
    /**
     * Includes input/expected/actual details for non-hidden cases.
     * Run operations enable this; submit operations must not.
     */
    includeTestCaseDetails?: boolean;
}
