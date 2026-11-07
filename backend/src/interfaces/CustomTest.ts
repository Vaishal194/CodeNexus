export interface customTest{
    title: string;
    description?: string | undefined;
    duration_minutes?: Number | undefined;
    total_marks: Number;
    join_code:string | number,
    visibility:"public" | "private"
    start_time:string,
    end_time:string
}