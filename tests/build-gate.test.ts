import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import path from 'node:path';
it('una compilacion fallida impide generar bundles y publicar archivos viejos',()=>{
 let writes=0;
 const fs={readdirSync:()=>['broken.ts'],existsSync:()=>true,readFileSync:()=>'',writeFileSync:()=>writes++};
 expect(()=>runInNewContext(readFileSync('scripts/build.js','utf8'),{
  __dirname:path.resolve('scripts'),Buffer,console:{log(){},warn(){},error(){}},
  process:{exit:(code:number)=>{throw Error('exit '+code);}},
  require:(id:string)=>id==='fs'?fs:id==='path'?path:id==='child_process'?{execSync:(cmd:string)=>{if(cmd.includes('esbuild'))throw Error('Archivo bloqueado');}}:{}
 })).toThrow('exit 1');
 expect(writes).toBe(0);
});
