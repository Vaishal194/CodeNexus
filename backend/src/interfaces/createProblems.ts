export interface createProblem{

    "title":string,
    "description":string,
    "difficulty":"Easy" | "Medium" | "Hard",
    "supported_languages":string[],
    "input":string,
    "output":string,
    "constraints":string[],
};