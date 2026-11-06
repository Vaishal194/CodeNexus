import {pool} from "../database.js"
import { TestQuestion } from "../interfaces/TestQuestions.js";

export async function addQuestionTest(data:TestQuestion){
    const query=`INSERT INTO TEST_QUESTIONS (test_id,question_type,mcq_id,problem_id,marks,sequence_number)
    VALUES($1,$2,$3,$4,$5,$6) RETURNING *`
    const values=[data.test_id,data.question_type,data.mcq_id,data.problem_id,data.marks,data.sequence_number]
    const result=await pool.query(query,values)
    return result.rows[0]
}

export async function removeQuestionTest(id:Number){
    const query=`DELETE FROM TEST_QUESTIONS WHERE id=$1`
    const values=[id]
    const res=await pool.query(query,values)
    return res.rows[0]
}

export async function fetchAll(){
    const query='SELECT *FROM TEST_QUESTIONS'
    const res=await pool.query(query,[])
    return res.rows
}

export async function fetchById(id: number) {
    const query = `
        SELECT
            tq.id,
            tq.test_id,
            tq.question_type,
            tq.marks,
            tq.sequence_number,

            CASE
                WHEN tq.question_type = 'mcq'
                THEN jsonb_build_object(
                    'id', m.id,
                    'question', m.question,
                    'options', m.options,
                    'correct_option', m.correct_option,
                    'explanation', m.explanation
                )

                WHEN tq.question_type = 'coding'
                THEN jsonb_build_object(
                    'id', p.id,
                    'title', p.title,
                    'description', p.description,
                    'difficulty', p.difficulty,
                    'supported_languages', p.supported_languages,
                    'input_format', p.input_format,
                    'output_format', p.output_format,
                    'constraints', p.constraints
                )
            END AS question

        FROM TEST_QUESTIONS tq

        LEFT JOIN MCQ_FORMAT m
            ON tq.mcq_id = m.id

        LEFT JOIN PROBLEMS p
            ON tq.problem_id = p.id

        WHERE tq.id = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
}