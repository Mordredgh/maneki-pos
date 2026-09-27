import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {transformSync} from 'esbuild';

it('Cancelar en la confirmacion entrega false booleano, no un texto verdadero',()=>{
 const events:any={};let result:any='unset';
 const ctx:any=createContext({document:{addEventListener:(name:string,fn:any)=>{events[name]??=fn;}},window:{confirmModalResolve:(v:any)=>{result=v;}},console});
 runInContext(transformSync(readFileSync('src/csp-delegate.ts','utf8'),{loader:'ts',target:'es2020'}).code,ctx);
 const button:any={dataset:{action:'confirmModalResolve',arg:'false'}};
 events.click({target:{closest:()=>button}});
 expect(result).toBe(false);
});
