import {randomBytes,scryptSync,createCipheriv,createDecipheriv} from 'node:crypto';
const keyCache=new Map();
function derive(password,salt){const cacheKey=password+':'+salt.toString('hex');let key=keyCache.get(cacheKey);if(!key){key=scryptSync(password,salt,32);keyCache.set(cacheKey,key);}return key;}
export function encryptBlob(data,password){
 if(!Buffer.isBuffer(data)||!password||password.length<24)throw Error('Blob o clave inválidos');
 const cached=keyCache.get(password)||(()=>{const salt=randomBytes(16),key=derive(password,salt);const value={salt,key};keyCache.set(password,value);return value;})();
 const salt=cached.salt,iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',cached.key,iv),payload=Buffer.concat([cipher.update(data),cipher.final()]);
 return Buffer.concat([Buffer.from('BICHOBL1'),salt,iv,cipher.getAuthTag(),payload]);
}
export function decryptBlob(buffer,password){
 if(!Buffer.isBuffer(buffer)||buffer.subarray(0,8).toString()!=='BICHOBL1')throw Error('Blob inválido');
 const decipher=createDecipheriv('aes-256-gcm',derive(password,buffer.subarray(8,24)),buffer.subarray(24,36));decipher.setAuthTag(buffer.subarray(36,52));return Buffer.concat([decipher.update(buffer.subarray(52)),decipher.final()]);
}
