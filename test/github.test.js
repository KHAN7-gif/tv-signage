import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {configVersion,saveConfig,uploadMedia} from '../public/github.js';
test('GitHub config snapshot and optimistic concurrency preserve UTF-8 and reject conflicts',async()=>{
 const original=globalThis.fetch; const config={ticker:'Selamat datang 🎮',landscape:[],portrait:[],duration:10};let count=0;
 globalThis.fetch=async(url,options)=>{count++;assert.ok(options.headers.Authorization==='Bearer test-token');if(count===1)return Response.json({sha:'old-sha',content:Buffer.from(JSON.stringify(config)).toString('base64')});const body=JSON.parse(options.body);assert.equal(body.sha,'old-sha');assert.equal(JSON.parse(Buffer.from(body.content,'base64').toString()).ticker,config.ticker);return Response.json({message:'conflict'},{status:409})};
 try{const snapshot=await configVersion('test-token');assert.deepEqual(snapshot,{sha:'old-sha',config});await assert.rejects(saveConfig(config,'test-token',snapshot.sha),/konflik/)}finally{globalThis.fetch=original}
});
test('upload rejects oversize files before making GitHub requests',async()=>{await assert.rejects(uploadMedia({size:21*1024*1024},'token'),/20 MB/)});
test('production config points to live booking hosting and contains no credentials',()=>{const c=JSON.parse(fs.readFileSync(new URL('../public/config.json',import.meta.url)));assert.equal(c.bookingStatusUrl,'https://royalblue-oryx-448762.hostingersite.com/display-api/status');assert.ok(!JSON.stringify(c).includes('API_KEY'))});
