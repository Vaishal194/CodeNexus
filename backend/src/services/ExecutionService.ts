import CppRunner from "../runners/CppRunner.js";
import javaRunner from "../runners/javaRunner.js";

export default async function(lang:string,code:string,input:string){
    console.log(input)
    console.log(lang)
    if(lang=='C++')
        return await CppRunner(code,input)
    else if(lang=='java')
        return await javaRunner(code,input)
}