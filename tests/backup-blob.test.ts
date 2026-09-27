import {it,expect} from 'vitest';
import {encryptBlob,decryptBlob} from '../scripts/backup-blob.mjs';
it('cifra y verifica binarios de Storage sin aceptar alteraciones',()=>{const key='clave-ficticia-solo-pruebas-2026',source=Buffer.from([0,1,2,255,10]);const blob=encryptBlob(source,key);expect(decryptBlob(blob,key)).toEqual(source);blob[blob.length-1]^=1;expect(()=>decryptBlob(blob,key)).toThrow();});
