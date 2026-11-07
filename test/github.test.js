import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {configVersion,saveConfig} from '../public/github.js';
test('GitHub snapshot and conflict checks preserve Unicode without overwriting another admin',async()=>{
 const original=globalThis.fetch,config={youtubeUrl:'',driveImageUrl:'',ticker:'Selamat datang 🎮'};let count=0;
 globalThis.fetch=async(url,options)=>{count++;assert.equal(options.headers.Authorization,'Bearer test-token');if(count===1)return Response.json({sha:'old-sha',content:Buffer.from(JSON.stringify(config)).toString('base64')});const body=JSON.parse(options.body);assert.equal(body.sha,'old-sha');assert.deepEqual(JSON.parse(Buffer.from(body.content,'base64').toString()),config);return Response.json({message:'conflict'},{status:409})};
 try{assert.deepEqual(await configVersion('test-token'),{sha:'old-sha',config});await assert.rejects(saveConfig(config,'test-token','old-sha'),/konflik/)}finally{globalThis.fetch=original}
});
test('production config remains readable after migrating single links to playlists',async()=>{const {validateConfig}=await import('../public/media-links.js');const config=validateConfig(JSON.parse(fs.readFileSync(new URL('../public/config.json',import.meta.url))));assert.deepEqual(Object.keys(config).sort(),['festival','images','ticker','videos'])});
