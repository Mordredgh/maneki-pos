import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {transformSync} from 'esbuild';

it('abre el POS solo con sesion y rol administrador verificado', async () => {
  const ctx:any=createContext({navigator:{onLine:true},localStorage:{setItem(){}},console});
  ctx.window=ctx;
  runInContext(transformSync(readFileSync('src/auth.ts','utf8'),{loader:'ts'}).code,ctx);
  const client={auth:{getSession:async()=>({data:{session:{user:{id:'admin-test'}}}})},
    rpc:async(name:string,args:any)=>{expect(name).toBe('is_admin');expect(args).toEqual({_user_id:'admin-test'});return {data:true,error:null};}};
  expect(await ctx.requirePOSAdmin(client)).toBe(true);
});

it('una cuenta sin rol no desbloquea el POS aunque la contraseña sea valida', async () => {
  let submit:any, completed=false;
  const status={textContent:''}, button={disabled:false};
  const fields:any={email:{value:'sin-rol@example.test'},password:{value:'solo-prueba'}};
  const form={elements:{namedItem:(n:string)=>fields[n]},addEventListener:(_e:any,fn:any)=>submit=fn};
  const overlay={style:{},innerHTML:'',querySelector:(s:string)=>s==='form'?form:s==='button'?button:status,remove(){throw new Error('No debe desbloquear');}};
  const ctx:any=createContext({navigator:{onLine:true},localStorage:{removeItem(){}},console,
    document:{readyState:'complete',body:{children:[],appendChild(){}},createElement:()=>overlay}});
  ctx.window=ctx;
  runInContext(transformSync(readFileSync('src/auth.ts','utf8'),{loader:'ts'}).code,ctx);
  const session={user:{id:'sin-rol'}};
  ctx.requirePOSAdmin({auth:{getSession:async()=>({data:{session:null}}),signInWithPassword:async()=>({data:{session}})},
    rpc:async()=>({data:false,error:null})}).then(()=>completed=true);
  await new Promise(r=>setTimeout(r,0));
  await submit({preventDefault(){}});
  expect(completed).toBe(false);
  expect(status.textContent).toContain('no tiene permiso');
  expect(fields.password.value).toBe('');
});
