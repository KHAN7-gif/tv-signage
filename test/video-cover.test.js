import {test} from 'node:test';
import assert from 'node:assert/strict';
import {coverImageUrl,validateConfig} from '../public/media-links.js';
import {playingVideo} from '../public/video-cover.js';
const first='https://youtu.be/jfKfPfyJRdk',second='https://youtu.be/5qap5aO4i9A';
test('optional cover URL survives validation while old video records and other content remain unchanged',()=>{
 const config={festival:'deepavali',videos:[{url:first,coverUrl:' https://image.api.playstation.com/example.png '},{url:second}],images:[],ticker:'MAIDA'};
 const validated=validateConfig(config);assert.equal(validated.videos[0].coverUrl,'https://image.api.playstation.com/example.png');
 assert.deepEqual(validated.videos[1],{url:second});assert.equal(validated.festival,config.festival);assert.equal(validated.ticker,config.ticker);
 assert.deepEqual(validateConfig({...config,videos:[{url:first,coverUrl:' '}]}).videos,[{url:first}]);
 for(const bad of ['http://example.com/image.jpg','javascript:alert(1)','https://user:password@example.com/image.png',null])assert.throws(()=>coverImageUrl(bad));
});
test('covers follow actual video identity and playlist position, including tail playlists, repeats, skipped and unknown videos',()=>{
 const videos=[{url:first,coverUrl:'https://example.com/one.png'},{url:second},{url:first,coverUrl:'https://example.com/three.png'}];
 const ids=['jfKfPfyJRdk','5qap5aO4i9A','jfKfPfyJRdk'];
 assert.equal(playingVideo(videos,ids[0],2,ids),videos[2]);
 assert.equal(playingVideo(videos,ids[1],0,ids.slice(1)),videos[1]);
 assert.equal(playingVideo(videos,ids[0],1,ids.slice(1)),videos[2]);
 assert.equal(playingVideo(videos,ids[1],-1,[]),videos[1]);
 assert.equal(playingVideo(videos,'unknown',0,ids),null);assert.equal(playingVideo(videos,'',0,ids),null);
});
test('COMING SOON is optional and per-video, retaining only checked values',()=>{
 const config={videos:[{url:first,comingSoon:true},{url:second,comingSoon:false}],images:[],ticker:''};
 assert.deepEqual(validateConfig(config).videos,[{url:first,comingSoon:true},{url:second}]);
 assert.throws(()=>validateConfig({...config,videos:[{url:first,comingSoon:'yes'}]}),/COMING SOON/);
});
test('NEW persists independently of legacy Coming Soon, with at most one label per video',async()=>{
 const {videoLabel}=await import('../public/video-cover.js');
 const config={videos:[{url:first,isNew:true},{url:second,comingSoon:true}],images:[],ticker:''};
 assert.deepEqual(validateConfig(config).videos,config.videos);
 assert.equal(videoLabel(config.videos[0]),'NEW');assert.equal(videoLabel(config.videos[1]),'COMING SOON');assert.equal(videoLabel({}), '');
 assert.deepEqual(validateConfig({...config,videos:[{url:first,isNew:false}]}).videos,[{url:first}]);
 assert.throws(()=>validateConfig({...config,videos:[{url:first,isNew:true,comingSoon:true}]}),/Pilih hanya/);
 assert.throws(()=>validateConfig({...config,videos:[{url:first,isNew:'yes'}]}),/NEW/);
});
