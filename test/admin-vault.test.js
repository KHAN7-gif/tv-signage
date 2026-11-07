import {test} from 'node:test';
import assert from 'node:assert/strict';
import {encryptToken,decryptToken,storeAccess,readStoredAccess,hasStoredAccess,forgetAccess,vaultKey} from '../public/admin-vault.js';
const token='github_pat_fake_for_test_only',password='Correct-password-123';
test('local vault uses randomized authenticated encryption and never stores token or password in plaintext',async()=>{
 const record=await encryptToken(token,password),second=await encryptToken(token,password);
 assert.ok(!JSON.stringify(record).includes(token));assert.ok(!JSON.stringify(record).includes(password));
 assert.notEqual(record.salt,second.salt);assert.notEqual(record.iv,second.iv);assert.notEqual(record.ciphertext,second.ciphertext);
 assert.equal(await decryptToken(record,password),token);
 await assert.rejects(decryptToken(record,'Wrong-password-123'),/Kata laluan/);
 const bytes=Buffer.from(record.ciphertext,'base64');bytes[0]^=1;
 await assert.rejects(decryptToken({...record,ciphertext:bytes.toString('base64')},password),/Kata laluan/);
 await assert.rejects(decryptToken({...record,iterations:1},password),/rosak/);
});
test('password setup rejects weak passwords and browser storage can be reset without changing media',async()=>{
 await assert.rejects(encryptToken(token,'short'),/10 aksara/);
 const previous=globalThis.localStorage,data=new Map();
 globalThis.localStorage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
 try{assert.equal(hasStoredAccess(),false);const record=await encryptToken(token,password);storeAccess(record);assert.deepEqual(readStoredAccess(),record);assert.equal(hasStoredAccess(),true);assert.deepEqual([...data.keys()],[vaultKey]);assert.ok(!data.get(vaultKey).includes(token));forgetAccess();assert.equal(hasStoredAccess(),false)}finally{globalThis.localStorage=previous}
});
