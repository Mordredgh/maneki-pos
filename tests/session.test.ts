import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { transformSync } from 'esbuild';

it('una segunda ventana no inicia el POS y muestra como recuperar acceso', async () => {
  let held = false;
  const locks = {request: async (_name:any, _options:any, action:any) => {
    if (held) return action(null);
    held=true;
    return action({name:'pos'});
  }};
  function page() {
    const body:any={children:[],textContent:'',style:{},appendChild(el:any){this.textContent+=el.textContent || '';}};
    const ctx:any=createContext({navigator:{locks},document:{readyState:'complete',body,
      createElement(){return {style:{},appendChild(){}};},addEventListener(){}},
      addEventListener(){},location:{reload(){}},console});
    ctx.window=ctx;
    runInContext(transformSync(readFileSync('src/session.ts','utf8'),{loader:'ts'}).code,ctx);
    return {ctx,body};
  }
  const first=page(), second=page();
  expect(await first.ctx._posTabReady).toBe(true);
  expect(await second.ctx._posTabReady).toBe(false);
  expect(second.body.textContent).toContain('otra ventana');
  expect(second.body.textContent).toContain('Recargar');
});
