import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
test('public status excludes inactive stations, future/cancelled sessions and private fields',async()=>{
 let handler;const now=Date.now();
 const records=[{sid:1,status:'a',st:new Date(now-60000),et:new Date(now+60000),customer:'secret',amt:99},{sid:2,status:'c',st:new Date(now-60000),et:new Date(now+60000)},{sid:2,status:'a',st:new Date(now+30000),et:new Date(now+60000)}];
 const context={module:{exports:{}},Date,require:p=>p==='express'?{Router:()=>({use(){},get:(_,fn)=>{handler=fn}})}:p==='./db'?{query:async q=>q.includes('kv_blobs')?[[{data:{list:[{id:1,name:'PS5'},{id:2,name:'PS4'},{id:3,active:false}]}}]]:[records]}:{COLLECTIONS:{ps:{}},joinRecord:r=>r,parseJsonCol:x=>x}};
 vm.runInNewContext(fs.readFileSync(new URL('../integrations/maidalegacy/display-status.cjs',import.meta.url),'utf8'),context);
 let result;await handler({}, {set(){},json:x=>result=x,status(){throw Error('unexpected status')}});
 assert.equal(result.stations.length,2);assert.ok(result.stations[0].endsAt);assert.equal(result.stations[1].endsAt,null);assert.ok(!JSON.stringify(result).includes('secret'));assert.ok(!('amt' in result.stations[0]));
});
