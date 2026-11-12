import { violation } from "../interfaces/TestViolation.js";
import { supabase } from "../config/supabase.js";
import {pool} from "../database.js"
export async function addViolation(
    attemptId: number,
    studentId: string,
    testId: number,
    inpData: violation
) {
    // Step 1: Check whether the attempt is visible to this Supabase client
    const { data: attempt, error: lookupError } = await supabase
        .from("test_attempts")
        .select("id, student_id, test_id, status, is_disqualified")
        .eq("id", attemptId)
        .maybeSingle();

    console.log("Attempt Lookup:", attempt);
    console.log("Lookup Error:", lookupError);

    // Step 2: Check the ownership and status values
    if (attempt) {
        console.log("Validation:", {
            studentMatches: attempt.student_id === studentId,
            testMatches: Number(attempt.test_id) === testId,
            status: attempt.status,
            isDisqualified: attempt.is_disqualified
        });
    }

    // Step 3: Call RPC
    const { data, error } = await supabase.rpc(
        "record_test_violation",
        {
            p_attempt_id: attemptId,
            p_user_id: studentId,
            p_test_id: testId,
            p_violation_type: inpData.violation_type,
            p_details: inpData.details,
            p_event_id: inpData.event_id
        }
    );

    console.log("RPC Result:", data);
    console.log("RPC Error:", error);

    if (error) {
        throw error;
    }

    return data;
}
export async function isDisqualified(attemptId:number,testId:number,studentId:string){
    const query=`SELECT is_disqualified,disqualification_reason FROM test_attempts WHERE id=$1
    AND test_id=$2 AND student_id=$3`
    const values=[attemptId,testId,studentId]
    const result=await pool.query(query,values)

    return result.rows
}