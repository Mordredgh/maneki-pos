import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {transformSync} from 'esbuild';
it('no permite salir mientras se prepara una operacion',async()=>{
 const ctx:any=createContext({console});ctx.window=ctx;ctx._posOperation={};
 runInContext(transformSync(readFileSync('src/auth.ts','utf8'),{loader:'ts'}).code,ctx);
 await expect(ctx.posSignOut({auth:{signOut(){throw Error('No debe llamarse');}}})).rejects.toThrow('operacion');
});

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

it('cerrar sesion conserva pendientes y no cierra autenticacion hasta guardarlos', async () => {
  let signedOut=false;
  const ctx:any=createContext({window:null,localStorage:{removeItem(){}},location:{reload(){}},console});ctx.window=ctx;
  ctx._pendingSync=true;
  runInContext(transformSync(readFileSync('src/auth.ts','utf8'),{loader:'ts'}).code,ctx);
  await expect(ctx.posSignOut({auth:{signOut:async()=>{signedOut=true;return {error:null}}}})).rejects.toThrow('pendientes');
  expect(signedOut).toBe(false);
});

it('cerrar sesion confirmado revoca sesion local y elimina acceso offline', async () => {
  const removed:string[]=[];let reload=false;
  const ctx:any=createContext({localStorage:{setItem(){},removeItem:(k:string)=>removed.push(k)},location:{reload:()=>reload=true},console});ctx.window=ctx;
  runInContext(transformSync(readFileSync('src/auth.ts','utf8'),{loader:'ts'}).code,ctx);
  await ctx.posSignOut({auth:{signOut:async(o:any)=>{expect(o.scope).toBe('local');return {error:null}}}});
  expect(removed).toContain('pos_verified_admin');expect(reload).toBe(true);
});

it('la sesion bloqueada no permite reusar automaticamente el token guardado', async () => {
  let checked=false;
  const overlay:any={style:{},querySelector:(s:string)=>s==='form'?{addEventListener(){}}:{},innerHTML:''};
  const ctx:any=createContext({navigator:{onLine:true},localStorage:{getItem:()=> '1'},document:{readyState:'complete',body:{children:[],appendChild(){}},createElement:()=>overlay},console});ctx.window=ctx;
  runInContext(transformSync(readFileSync('src/auth.ts','utf8'),{loader:'ts'}).code,ctx);
  ctx.requirePOSAdmin({auth:{getSession:async()=>({data:{session:{user:{id:'admin'}}}})},rpc:async()=>{checked=true;return {data:true}}});
  await new Promise(r=>setTimeout(r,0));expect(checked).toBe(false);
});
