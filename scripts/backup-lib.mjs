import {randomBytes,scryptSync,createCipheriv,createDecipheriv} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
export function validateSnapshot(snapshot){
 if(snapshot?.format!=='bicho-pos-tables-v1'||!snapshot.tables||Array.isArray(snapshot.tables))throw Error('Formato de respaldo invalido');
 for(const [name,rows] of Object.entries(snapshot.tables))if(!/^[a-zA-Z_]+$/.test(name)||!Array.isArray(rows)||rows.some(row=>!row||typeof row!=='object'||Array.isArray(row)))throw Error('Tabla de respaldo invalida');
 for(const name of ['products','orders','incomes','expenses','store'])if(!Array.isArray(snapshot.tables[name]))throw Error('Respaldo incompleto: '+name);
 return snapshot;
}
export function encryptSnapshot(snapshot,password){
 validateSnapshot(snapshot);if(!password||password.length<24)throw Error('La clave del respaldo debe tener al menos 24 caracteres');
 const salt=randomBytes(16),iv=randomBytes(12),key=scryptSync(password,salt,32),cipher=createCipheriv('aes-256-gcm',key,iv);
 const payload=Buffer.concat([cipher.update(gzipSync(JSON.stringify(snapshot))),cipher.final()]);
 return Buffer.concat([Buffer.from('BICHOBK1'),salt,iv,cipher.getAuthTag(),payload]);
}
export function decryptSnapshot(buffer,password){
 if(buffer.subarray(0,8).toString()!=='BICHOBK1')throw Error('Archivo de respaldo invalido');
 const decipher=createDecipheriv('aes-256-gcm',scryptSync(password,buffer.subarray(8,24),32),buffer.subarray(24,36));decipher.setAuthTag(buffer.subarray(36,52));
 return validateSnapshot(JSON.parse(gunzipSync(Buffer.concat([decipher.update(buffer.subarray(52)),decipher.final()])).toString()));
}
