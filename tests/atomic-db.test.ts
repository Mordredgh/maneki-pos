import {it,expect} from 'vitest';
import {createTestDatabase} from '../staging/database.mjs';
import {encryptSnapshot,decryptSnapshot} from '../scripts/backup-lib.mjs';
it('restaura un respaldo completo en otra base y conserva saldos y cortes',async()=>{
 const source=await createTestDatabase(),target=await createTestDatabase();try{
  await source.exec("INSERT INTO products(id,name,stock) VALUES ('restore-p','Taza',3); INSERT INTO incomes(id,amount,date,method) VALUES ('restore-i',20.10,'2026-09-27','Efectivo'); INSERT INTO store VALUES ('cashClosures','[{\"id\":\"corte-test\"}]');");
  const snapshot=(await source.query('SELECT public.pos_backup_snapshot() AS data')).rows[0].data;
  const restored=decryptSnapshot(encryptSnapshot(snapshot,'clave-local-ficticia-2026'),'clave-local-ficticia-2026');
  for(const table of ['categories','clients','products','orders','orders_finalizados','sales_history','incomes','expenses','stock_movements','store']){
   await target.query(`INSERT INTO public.${table} SELECT * FROM jsonb_populate_recordset(null::public.${table},$1::jsonb)`,[JSON.stringify(restored.tables[table])]);
   expect((await target.query(`SELECT count(*)::int AS n FROM public.${table}`)).rows[0].n).toBe(restored.tables[table].length);
  }
  expect(Number((await target.query("SELECT amount FROM incomes WHERE id='restore-i'")).rows[0].amount)).toBe(20.10);
  expect((await target.query("SELECT value FROM store WHERE key='cashClosures'")).rows[0].value).toContain('corte-test');
 }finally{await source.close();await target.close();}
},30000);
it('caja consulta todos los movimientos y rechaza usuarios ajenos',async()=>{
 const db=await createTestDatabase();try{
  await db.exec("INSERT INTO expenses(id,amount,date,method) VALUES ('cash-test',10,'2026-09-27','Efectivo');");
  const rows=(await db.query("SELECT public.pos_cash_movements('2026-09-27') AS data")).rows[0].data as any;
  expect(rows.expenses).toHaveLength(1);expect(rows.expenses[0].method).toBe('Efectivo');
  await db.exec("SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',false)");
  await expect(db.query("SELECT public.pos_cash_movements('2026-09-27')")).rejects.toThrow('Acceso');
 }finally{await db.close();}
},30000);
it('el historial identifica cambios y no permite reescribirlos desde la aplicacion',async()=>{
 const db=await createTestDatabase();try{
  await db.query('SELECT public.pos_apply_write($1,$2::jsonb,$3::jsonb)', ['products',JSON.stringify([{id:'audit-test',stock:10}]),JSON.stringify({'audit-test':null})]);
  const history=(await db.query('SELECT * FROM public.pos_list_changes(20)')).rows;
  expect(history[0]).toMatchObject({table_name:'products',record_id:'audit-test',action:'INSERT',actor:'00000000-0000-4000-8000-000000000001',new_data:{stock:10}});
  await expect(db.exec('DELETE FROM public.pos_audit_log')).rejects.toThrow();
 }finally{await db.close();}
},30000);
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
