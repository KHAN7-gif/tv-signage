import {test} from 'node:test';
import assert from 'node:assert/strict';
import {youtubeId,youtubeEmbed,driveImage,driveVideo,validateConfig} from '../public/media-links.js';
test('YouTube links become audible looping embeds while non-video and hostile hosts are rejected',()=>{
 for(const url of ['https://www.youtube.com/watch?v=jfKfPfyJRdk','https://youtu.be/jfKfPfyJRdk?si=abc','https://youtube.com/live/jfKfPfyJRdk','https://youtube.com/shorts/jfKfPfyJRdk'])assert.equal(youtubeId(url),'jfKfPfyJRdk');
 const embed=new URL(youtubeEmbed('https://youtu.be/jfKfPfyJRdk','https://khan7-gif.github.io'));assert.equal(embed.origin,'https://www.youtube-nocookie.com');assert.equal(embed.searchParams.get('mute'),'0');assert.equal(embed.searchParams.get('playlist'),'jfKfPfyJRdk');
 for(const bad of ['https://youtube.com/@channel','https://youtube.com/playlist?list=123','https://youtube.com.evil.test/watch?v=jfKfPfyJRdk','javascript:alert(1)'])assert.throws(()=>youtubeId(bad));
});
test('Google Drive file links are accepted, folders and unrelated links are rejected',()=>{
 const id='AbCdEfGhIjKlMn0123';assert.equal(driveImage(`https://drive.google.com/file/d/${id}/view?usp=sharing`),`https://drive.google.com/thumbnail?id=${id}&sz=w1600`);assert.ok(driveImage(`https://drive.google.com/open?id=${id}`).includes(id));
 assert.throws(()=>driveImage(`https://drive.google.com/drive/folders/${id}`));assert.throws(()=>driveImage(`https://example.com/file/d/${id}/view`));
});
test('legacy single links migrate without dropping media; playlists keep order and durations',()=>{
 const legacy=validateConfig({youtubeUrl:' https://youtu.be/jfKfPfyJRdk ',driveImageUrl:'https://drive.google.com/file/d/AbCdEfGhIjKlMn0123/view',ticker:' hello '});
 assert.deepEqual(legacy,{videos:[{url:'https://youtu.be/jfKfPfyJRdk'}],images:[{url:'https://drive.google.com/file/d/AbCdEfGhIjKlMn0123/view',duration:10,type:'image'}],ticker:'hello'});
 const config=validateConfig({videos:[{url:'https://youtu.be/jfKfPfyJRdk'},{url:'https://youtu.be/5qap5aO4i9A'}],images:[{url:'https://drive.google.com/open?id=AbCdEfGhIjKlMn0123',duration:5}],ticker:''});
 assert.equal(config.videos.length,2);assert.equal(config.images[0].duration,5);
 const embed=new URL(youtubeEmbed(config.videos[0].url,'https://khan7-gif.github.io',config.videos.map(item=>item.url)));assert.equal(embed.searchParams.get('playlist'),'5qap5aO4i9A');assert.equal(embed.searchParams.get('loop'),'1');
});
test('empty lists clear slots; incomplete links and invalid image durations cannot be published',()=>{
 assert.deepEqual(validateConfig({videos:[],images:[],ticker:' hi '}),{videos:[],images:[],ticker:'hi'});
 assert.throws(()=>validateConfig({videos:[{url:''}],images:[],ticker:''}),/Video 1/);
 assert.throws(()=>validateConfig({videos:[],images:[{url:'https://drive.google.com/open?id=AbCdEfGhIjKlMn0123',duration:0}],ticker:''}),/3 hingga 300/);
 assert.throws(()=>validateConfig({videos:[],images:[],ticker:'x'.repeat(2001)}));
});

test('admin preview can explicitly remain muted',()=>{
 const url=new URL(youtubeEmbed('https://youtu.be/jfKfPfyJRdk','https://khan7-gif.github.io',undefined,true));
 assert.equal(url.searchParams.get('mute'),'1');
});

test('mixed portrait media preserves order, type and Drive resource keys',()=>{
 const url='https://drive.google.com/file/d/AbCdEfGhIjKlMn0123/view?resourcekey=key-123';
 const config=validateConfig({videos:[],images:[{url,duration:5},{url,type:'video'}],ticker:''});
 assert.deepEqual(config.images.map(item=>item.type),['image','video']);
 assert.equal(config.images[0].duration,5);
 const video=new URL(driveVideo(url));
 assert.equal(video.hostname,'drive.google.com');assert.equal(video.searchParams.get('export'),'download');
 assert.equal(video.searchParams.get('resourcekey'),'key-123');
 assert.equal(new URL(driveImage(url)).searchParams.get('resourcekey'),'key-123');
 assert.throws(()=>validateConfig({videos:[],images:[{url,type:'iframe'}],ticker:''}),/Jenis media/);
 for(const bad of ['https://drive.google.com/drive/folders/AbCdEfGhIjKlMn0123','https://evil.test/file/d/AbCdEfGhIjKlMn0123/view'])assert.throws(()=>driveVideo(bad));
});
