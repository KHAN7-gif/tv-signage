import {test} from 'node:test';import assert from 'node:assert/strict';import {thumbnailUrl} from '../public/gallery.js';
test('gallery chooses per-video cover or YouTube thumbnail and Drive image, tolerating incomplete new rows',()=>{
 const item={url:'https://youtu.be/jfKfPfyJRdk',coverUrl:'https://image.api.playstation.com/game.png'};
 assert.equal(thumbnailUrl(item,'videos'),item.coverUrl);assert.equal(thumbnailUrl({url:item.url},'videos'),'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg');
 assert(thumbnailUrl({url:'https://drive.google.com/file/d/AbCdEfGhIjKlMn0123/view'},'images').includes('thumbnail?id=AbCdEfGhIjKlMn0123'));
 assert.equal(thumbnailUrl({url:''},'videos'),'');assert.equal(thumbnailUrl({url:'javascript:alert(1)'},'images'),'');
});
