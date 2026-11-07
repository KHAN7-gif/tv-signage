import {test} from 'node:test';
import assert from 'node:assert/strict';
import {overlayState} from '../public/overlay-state.js';
test('PS Overlay labels and countdown match Free, Online and 10 min boundaries',()=>{
 const now=Date.parse('2026-11-07T10:00:00Z');
 assert.deepEqual(overlayState({endsAt:null},now),{busy:false,warning:false,label:'Free',time:'00:00:00'});
 assert.equal(overlayState({endsAt:new Date(now+600001)},now).label,'Online');
 assert.deepEqual(overlayState({endsAt:new Date(now+600000)},now),{busy:true,warning:true,label:'10 min',time:'00:10:00'});
 assert.equal(overlayState({endsAt:new Date(now+3257000)},now).time,'00:54:17');
 assert.equal(overlayState({endsAt:new Date(now)},now).label,'Free');
});
