import CppRunner from "../runners/CppRunner.js";

export default async function(lang:string,code:string,input:string){
    console.log(input)
    console.log(lang)
    if(lang=='C++')
        return await CppRunner(code,input)
}