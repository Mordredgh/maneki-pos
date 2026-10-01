import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {transformSync} from 'esbuild';

function loader(){
 const scripts:any[]=[];
 const document:any={querySelector:(q:string)=>q==='script[src="js/core.bundle.js"]'?{}:scripts.find(s=>q===`script[src="${s.src}"]`)||null,
  createElement:()=>{const handlers:any={};const el:any={addEventListener:(name:string,fn:any)=>{handlers[name]=fn;},remove:()=>{scripts.splice(scripts.indexOf(el),1);},emit:(name:string)=>{(handlers[name]||el['on'+name])?.();}};return el;},body:{appendChild:(el:any)=>scripts.push(el)}};
 const window:any={addEventListener(){}};
 runInNewContext(transformSync(readFileSync('src/lazy-loader.ts','utf8'),{loader:'ts'}).code,{window,document,console,setTimeout});
 return {window,scripts};
}
it('una seccion que falla al cargar permite reintentar sin quedar marcada como lista',async()=>{
 const {window,scripts}=loader();
 const failed=window._mkLazyLoad('inventory');const result=expect(failed).rejects.toThrow('cargar');scripts[0].emit('error');await result;
 expect(window._mkGrupoListo('inventory')).toBe(false);
 const retry=window._mkLazyLoad('inventory');expect(scripts).toHaveLength(1);scripts[0].emit('load');await retry;
 expect(window._mkGrupoListo('inventory')).toBe(true);
});
it('dos accesos simultaneos esperan el mismo modulo antes de marcarlo listo',async()=>{
 const {window,scripts}=loader();const a=window._mkLazyLoad('inventory'),b=window._mkLazyLoad('categorias');
 expect(scripts).toHaveLength(1);expect(window._mkGrupoListo('inventory')).toBe(false);
 scripts[0].emit('load');await Promise.all([a,b]);expect(window._mkGrupoListo('categorias')).toBe(true);
});

it('Balance muestra datos sin esperar la libreria de graficas',async()=>{
 const source=readFileSync('src/design-system.ts','utf8');let renders=0;
 const window:any={_mkLazyLoad:async()=>{},_mkGrupoListo:()=>true,_mkEnsureChartJs:()=>new Promise(()=>{}),renderBalance:()=>{renders++;}};
 const ctx:any={window,document:{getElementById:()=>null,querySelector:()=>null},setTimeout:(fn:any)=>fn()};
 runInNewContext(transformSync(source.slice(source.indexOf('const _lazySections'),source.indexOf('window._lazyLoad = _lazyLoad;')+'window._lazyLoad = _lazyLoad;'.length),{loader:'ts'}).code,ctx);
 await window._lazyLoad('balance');expect(renders).toBe(1);
});

it('Inventario no roba el foco despues de cambiar de seccion ni abre teclado al entrar en movil',()=>{
 const timers:any[]=[];let focused=0;const cls=()=>{const values=new Set<string>();return {add:(v:string)=>values.add(v),remove:(v:string)=>values.delete(v),contains:(v:string)=>values.has(v)};};
 const sections:any={inventory:{classList:cls(),style:{}},balance:{classList:cls(),style:{}}};
 const window:any={innerWidth:1200};
 const document:any={querySelectorAll:(q:string)=>q.includes('section')?Object.values(sections):[],querySelector:()=>null,getElementById:(id:string)=>id==='inventorySearch'?{focus:()=>{focused++;}}:sections[id.replace('-section','')]||null};
 runInNewContext(transformSync(readFileSync('src/navigation.ts','utf8'),{loader:'ts'}).code,{window,document,localStorage:{setItem(){}},requestAnimationFrame:(fn:any)=>fn(),setTimeout:(fn:any)=>timers.push(fn),clearTimeout(){},clearInterval(){}});
 window.showSection('inventory');window.showSection('balance');timers.splice(0).forEach(fn=>fn());expect(focused).toBe(0);
 window.innerWidth=390;window.showSection('inventory');timers.splice(0).forEach(fn=>fn());expect(focused).toBe(0);
 window.innerWidth=1200;window.showSection('inventory');timers.splice(0).forEach(fn=>fn());expect(focused).toBe(1);
});
