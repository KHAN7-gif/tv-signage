import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stationStatus} from '../bookings.js';
import worker from '../worker.js';
test('booking projection matches active sessions and omits private fields',()=>{
 const now=Date.parse('2026-11-07T10:00:00Z');
 const config={list:[{id:1,name:'PS5'},{id:2,name:'PS4'},{id:3,active:false}]};
 const records={a:{sid:'1',status:'a',st:'2026-11-07T09:00:00Z',et:'2026-11-07T11:00:00Z',customer:'private',amt:99},b:{sid:2,status:'a',st:'2026-11-07T11:00:00Z',et:'2026-11-07T12:00:00Z'},c:{sid:2,status:'c',st:'2026-11-07T09:00:00Z',et:'2026-11-07T11:00:00Z'}};
 const result=stationStatus(config,records,now);assert.equal(result.length,2);assert.equal(result[0].endsAt,'2026-11-07T11:00:00.000Z');assert.equal(result[1].endsAt,null);assert.ok(!JSON.stringify(result).includes('private'));assert.ok(!('amt' in result[0]));
 assert.equal(stationStatus(config,records,Date.parse('2026-11-07T12:00:00Z'))[0].endsAt,null);
 assert.throws(()=>stationStatus({},records,now));
});
test('missing booking credentials returns unavailable without exposing details',async()=>{
 const response=await worker.fetch(new Request('https://test/api/bookings'),{});assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:'Status PS Booking tidak tersedia.'});
});
test('booking endpoint rejects writes',async()=>{assert.equal((await worker.fetch(new Request('https://test/api/bookings',{method:'POST'}),{})).status,405)});
