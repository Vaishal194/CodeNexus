export type test_type="mcq" | "coding"

export interface Test{
    "title":string,
    "description":string,
    "duration_minutes":Number,
    "total_marks":Number,
    "is_published":boolean,
    "created_by":string,
}
export interface createTest{
    "title":string,
    "description"?:string,
    "duration_minutes"?:Number,
    "total_marks":Number,
}