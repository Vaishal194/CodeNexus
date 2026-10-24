import { test_type } from "./Contest.js"
export interface TestQuestion{
    "test_id":Number,
    "question_type":test_type,
    "mcq_id"?:Number,
    "problem_id"?:Number,
    "marks":Number,
    "sequence_number":Number
}