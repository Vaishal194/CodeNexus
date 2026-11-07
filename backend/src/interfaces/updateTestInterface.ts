export interface UpdateTest{
    "title"?:string,
    "description"?:string,
    "duration_minutes"?:number,
    "total_marks"?:number,
    "start_time"?:string,
    "end_time"?:string,
    "visibility":"private" | "public",
    "join_code":string | number
}