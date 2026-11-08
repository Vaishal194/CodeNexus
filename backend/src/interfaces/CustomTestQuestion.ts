export interface customTestMcqPayload {
    question: string;
    options: string[];
    correct_option: number;
    explanation?: string;
    marks: number;
}

export interface customTestCodingTestCasePayload {
    input?: string;
    expected_output?: string;
    is_hidden?: boolean;
    sequence_number?: number;
}

export interface customTestCodingPayload {
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard" | string;
    supported_languages: string[];
    input?: string;
    output?: string;
    constraints?: string[];
    marks: number;
    test_cases: customTestCodingTestCasePayload[];
}
