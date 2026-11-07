import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moveItem} from '../public/reorder.js';
test('moving records preserves identity, covers, badges, durations and duplicate entries',()=>{
 const a={url:'same',coverUrl:'cover',isNew:true},b={url:'same',comingSoon:true},c={url:'other',duration:17};
 const items=[a,b,c];assert.equal(moveItem(items,0,2),true);assert.deepEqual(items,[b,c,a]);assert.equal(items[2],a);
 assert.equal(moveItem(items,2,0),true);assert.deepEqual(items,[a,b,c]);
 const before=[...items];for(const [from,to] of [[0,0],[-1,0],[0,3],[3,0],[0,1.5]])assert.equal(moveItem(items,from,to),false);assert.deepEqual(items,before);
});
