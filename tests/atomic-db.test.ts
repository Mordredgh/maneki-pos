import {it,expect} from 'vitest';
import {createTestDatabase} from '../staging/database.mjs';
it('acepta UUID de cobros sin perder identificadores numericos anteriores',async()=>{
 const db=await createTestDatabase();
 try {
  const id='a9320a08-6d6b-4132-a66d-971d0eae8024';
  await db.query('SELECT public.pos_apply_operation($1,$2::jsonb)',['uuid-check',JSON.stringify([{table:'incomes',rows:[{id,amount:50}],expected:{[id]:null}},{table:'expenses',rows:[{id:'123',amount:10}],expected:{'123':null}}])]);
  expect((await db.query('SELECT id FROM incomes')).rows[0].id).toBe(id);
  expect(String((await db.query('SELECT id FROM expenses')).rows[0].id)).toBe('123');
 }finally{await db.close();}
},30000);
it('PostgreSQL revierte todo ante fallo intermedio y reenvia sin duplicar',async()=>{
 const db=await createTestDatabase();
 try{
 const ops=[{table:'orders',rows:[{id:'qa-order',total:100}],expected:{'qa-order':null}},{table:'incomes',rows:[{id:1,amount:50}],expected:{'1':null}}];
 const call=(id:string,payload:any)=>db.query('SELECT public.pos_apply_operation($1,$2::jsonb) AS result',[id,JSON.stringify(payload)]);
 await expect(call('fail',[ops[0],{...ops[1],table:'no_table'}])).rejects.toThrow();
 expect((await db.query('SELECT count(*)::int AS n FROM orders')).rows[0].n).toBe(0);
 await call('ok',ops);await call('ok',ops);
 expect((await db.query('SELECT count(*)::int AS n FROM incomes')).rows[0].n).toBe(1);
 await expect(call('ok',[ops[0]])).rejects.toThrow('reutilizado');
 const prior=(await db.query("SELECT to_jsonb(t) AS row FROM incomes t WHERE id='1'")).rows[0].row;
 await db.exec("UPDATE incomes SET amount=70 WHERE id='1'");
 await expect(call('stale',[{table:'orders',rows:[{id:'another',total:1}],expected:{another:null}},{table:'incomes',rows:[{id:1,amount:60}],expected:{'1':prior}}])).rejects.toThrow('Conflicto');
 expect((await db.query("SELECT count(*)::int AS n FROM orders WHERE id='another'")).rows[0].n).toBe(0);
 }finally{await db.close();}
},30000);
