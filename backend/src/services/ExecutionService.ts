import CppRunner from "../runners/CppRunner.js";
import javaRunner from "../runners/javaRunner.js";
import pythonRunner from "../runners/pythonRunner.js";

export default async function(lang:string,code:string,input:string){
    console.log(input)
    console.log(lang)
    if(lang=='C++')
        return await CppRunner(code,input)
    else if(lang=='java')
        return await javaRunner(code,input)
    else if(lang=="python")
        return await pythonRunner(code,input)
}