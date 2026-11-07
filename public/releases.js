const versionPattern=/^android-v(\d+\.\d+\.\d+)$/;
export function compareVersions(a,b){
 const left=a.split('.').map(Number),right=b.split('.').map(Number);
 for(let i=0;i<3;i++){if(left[i]!==right[i])return left[i]-right[i]}
 return 0;
}
export function publishedVersions(releases){
 if(!Array.isArray(releases))throw Error('Senarai versi tidak sah.');
 return releases.filter(r=>!r.draft&&!r.prerelease&&versionPattern.test(r.tag_name))
  .map(r=>({...r,version:versionPattern.exec(r.tag_name)[1]}))
  .sort((a,b)=>compareVersions(b.version,a.version));
}
export function apkDownloads(release){
 const prefix='https://github.com/KHAN7-gif/tv-signage/releases/download/';
 const assets=(release.assets||[]).filter(a=>/\.apk$/i.test(a.name)&&!/unsigned/i.test(a.name)&&a.browser_download_url?.startsWith(prefix));
 if(assets.length)return assets.map(a=>({name:a.name,url:a.browser_download_url}));
 // Previous signed APKs were published on Pages rather than as release assets.
 if(['1.0.0','1.1.0'].includes(release.version))return [{name:`Maida TV ${release.version}`,url:`https://khan7-gif.github.io/tv-signage/public/downloads/Maida-TV-Signage-v${release.version}.apk`}];
 return [];
}
