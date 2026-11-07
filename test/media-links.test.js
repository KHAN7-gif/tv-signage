import {test} from 'node:test';
import assert from 'node:assert/strict';
import {youtubeId,youtubeEmbed,driveImage,validateConfig} from '../public/media-links.js';
test('YouTube links become muted looping embeds while non-video and hostile hosts are rejected',()=>{
 for(const url of ['https://www.youtube.com/watch?v=jfKfPfyJRdk','https://youtu.be/jfKfPfyJRdk?si=abc','https://youtube.com/live/jfKfPfyJRdk','https://youtube.com/shorts/jfKfPfyJRdk'])assert.equal(youtubeId(url),'jfKfPfyJRdk');
 const embed=new URL(youtubeEmbed('https://youtu.be/jfKfPfyJRdk','https://khan7-gif.github.io'));assert.equal(embed.origin,'https://www.youtube-nocookie.com');assert.equal(embed.searchParams.get('mute'),'1');assert.equal(embed.searchParams.get('playlist'),'jfKfPfyJRdk');
 for(const bad of ['https://youtube.com/@channel','https://youtube.com/playlist?list=123','https://youtube.com.evil.test/watch?v=jfKfPfyJRdk','javascript:alert(1)'])assert.throws(()=>youtubeId(bad));
});
test('Google Drive file links are accepted, folders and unrelated links are rejected',()=>{
 const id='AbCdEfGhIjKlMn0123';assert.equal(driveImage(`https://drive.google.com/file/d/${id}/view?usp=sharing`),`https://drive.google.com/thumbnail?id=${id}&sz=w1600`);assert.ok(driveImage(`https://drive.google.com/open?id=${id}`).includes(id));
 assert.throws(()=>driveImage(`https://drive.google.com/drive/folders/${id}`));assert.throws(()=>driveImage(`https://example.com/file/d/${id}/view`));
});
test('only three public settings survive validation; empty media stays unconfigured',()=>{
 assert.deepEqual(validateConfig({youtubeUrl:' ',driveImageUrl:'',ticker:' hello ',bookingStatusUrl:'old'}),{youtubeUrl:'',driveImageUrl:'',ticker:'hello'});assert.throws(()=>validateConfig({youtubeUrl:'',driveImageUrl:'',ticker:'x'.repeat(2001)}));
});
