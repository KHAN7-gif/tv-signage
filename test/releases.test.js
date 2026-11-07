import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publishedVersions,compareVersions,apkDownloads} from '../public/releases.js';
test('updates use published stable Android versions in numeric order',()=>{
 const releases=publishedVersions([{tag_name:'android-v1.9.0'},{tag_name:'android-v1.10.0'},{tag_name:'android-v2.0.0',draft:true},{tag_name:'android-v3.0.0',prerelease:true},{tag_name:'website-v10.0.0'}]);
 assert.deepEqual(releases.map(r=>r.version),['1.10.0','1.9.0']);
 assert(compareVersions('1.10.0','1.9.0')>0);assert.equal(compareVersions('1.2.0','1.2.0'),0);
});
test('download links include legacy signed APKs and release assets, excluding unsigned builds and untrusted URLs',()=>{
 assert.equal(apkDownloads({version:'1.1.0'})[0].url,'https://khan7-gif.github.io/tv-signage/public/downloads/Maida-TV-Signage-v1.1.0.apk');
 assert.deepEqual(apkDownloads({version:'1.2.0',assets:[{name:'app-release-unsigned.apk',browser_download_url:'https://github.com/KHAN7-gif/tv-signage/releases/download/android-v1.2.0/app-release-unsigned.apk'},{name:'app.apk',browser_download_url:'https://example.com/app.apk'}]}),[]);
 const asset={name:'Maida-TV-v1.2.0.apk',browser_download_url:'https://github.com/KHAN7-gif/tv-signage/releases/download/android-v1.2.0/Maida-TV-v1.2.0.apk'};
 assert.equal(apkDownloads({version:'1.2.0',assets:[asset]})[0].url,asset.browser_download_url);
});
