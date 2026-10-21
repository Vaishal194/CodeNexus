export interface getProblemId{
    "title":string,
    "description":string,
    "id":Number,
    "difficulty":"Easy" | "Medium" | "Hard",
    "supported_languages":string[],
    "input_format":string,
    "output_format":string,
    "constraints":string[]
}