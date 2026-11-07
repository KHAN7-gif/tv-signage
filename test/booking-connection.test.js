import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getBookingStatus} from '../public/booking-connection.js';
const endpoint='https://example.com/display-api/status';
test('connection reports Hostinger blocking, HTML fallback and network/CORS failures',async()=>{
 await assert.rejects(getBookingStatus(endpoint,{fetchImpl:async()=>new Response('Bot Verification',{status:403})}),e=>e.code==='blocked');
 await assert.rejects(getBookingStatus(endpoint,{fetchImpl:async()=>new Response('<title>Finance</title>')}),e=>e.code==='html');
 await assert.rejects(getBookingStatus(endpoint,{fetchImpl:async()=>{throw new TypeError('Failed to fetch')}}),e=>e.code==='network');
});
test('connection validates data and times out without AbortSignal.timeout support',async()=>{
 const expected={stations:[{id:12,name:'eRacing 12',endsAt:null}]};
 assert.deepEqual(await getBookingStatus(endpoint,{fetchImpl:async()=>Response.json(expected)}),expected);
 await assert.rejects(getBookingStatus(endpoint,{fetchImpl:async()=>Response.json({stations:[{id:1,name:'PS5',endsAt:'invalid'}]})}),e=>e.code==='format');
 await assert.rejects(getBookingStatus(endpoint,{fetchImpl:()=>new Promise(()=>{}),timeoutMs:10}),e=>e.code==='timeout');
});
