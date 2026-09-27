import {it,expect} from 'vitest';
import {encryptSnapshot,decryptSnapshot} from '../scripts/backup-lib.mjs';
it('restaura el archivo cifrado y rechaza corrupcion o clave equivocada',()=>{
 const source={format:'bicho-pos-tables-v1',tables:{products:[{id:'p',stock:2}],orders:[],incomes:[],expenses:[],store:[{key:'cashClosures',value:'[]'}]}};
 const key='clave-ficticia-solo-pruebas-2026';const encrypted=encryptSnapshot(source,key);
 expect(decryptSnapshot(encrypted,key)).toEqual(source);
 expect(()=>decryptSnapshot(encrypted,'otra-clave-ficticia-2026')).toThrow();
 encrypted[encrypted.length-1]^=1;expect(()=>decryptSnapshot(encrypted,key)).toThrow();
});
