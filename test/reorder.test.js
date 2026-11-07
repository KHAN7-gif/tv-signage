import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moveItem} from '../public/reorder.js';
test('moving records preserves identity, covers, badges, durations and duplicate entries',()=>{
 const a={url:'same',coverUrl:'cover',isNew:true},b={url:'same',comingSoon:true},c={url:'other',duration:17};
 const items=[a,b,c];assert.equal(moveItem(items,0,2),true);assert.deepEqual(items,[b,c,a]);assert.equal(items[2],a);
 assert.equal(moveItem(items,2,0),true);assert.deepEqual(items,[a,b,c]);
 const before=[...items];for(const [from,to] of [[0,0],[-1,0],[0,3],[3,0],[0,1.5]])assert.equal(moveItem(items,from,to),false);assert.deepEqual(items,before);
});
test('gallery target follows both rows and columns, including gaps and partial rows',async()=>{
 const {gridTarget}=await import('../public/reorder.js');
 const cells=[{left:0,top:0,right:90,bottom:120},{left:100,top:0,right:190,bottom:120},{left:0,top:130,right:90,bottom:250}];
 assert.equal(gridTarget(cells,150,40),1);assert.equal(gridTarget(cells,40,180),2);assert.equal(gridTarget(cells,94,40),0);assert.equal(gridTarget(cells,150,180),2);assert.equal(gridTarget([],10,10),-1);
});
