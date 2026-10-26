export interface TestAttempt {
    id?: number;
    test_id: number;
    student_id: string;
    started_at?: Date;
    submitted_at?: Date | null;
    status: "IN_PROGRESS" | "SUBMITTED" | "EVALUATED";
    total_marks: number;
    score: number;
}