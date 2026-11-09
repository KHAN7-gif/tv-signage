import {publishedVersions,compareVersions,apkDownloads} from './releases.js?v=about-1';
const $=id=>document.getElementById(id);
const requested=new URLSearchParams(location.search).get('installed');
const installed=/^\d+\.\d+\.\d+$/.test(requested||'')?requested:null;
$('installed').textContent=installed?`Versi APK dipasang: ${installed}`:'Versi APK dipasang: buka About melalui menu aplikasi untuk melihat versi peranti.';
function link(text,url,className='button-link'){
 const a=document.createElement('a');a.textContent=text;a.href=url;a.className=className;a.target='_blank';a.rel='noopener';return a;
}
async function check(){
 $('check').disabled=true;$('update-status').textContent='Menyemak versi yang diterbitkan…';
 try{
  const response=await fetch('https://api.github.com/repos/KHAN7-gif/tv-signage/releases?per_page=100',{cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
  if(!response.ok)throw Error('GitHub tidak dapat dihubungi.');
  const releases=publishedVersions(await response.json());$('releases').replaceChildren();
  const latest=releases.find(r=>apkDownloads(r).length);
  $('update-status').textContent=!latest?'Belum ada APK yang boleh dimuat turun.':!installed?`Versi tersedia: ${latest.version}`:compareVersions(latest.version,installed)>0?`Kemas kini tersedia: ${latest.version}`:`Anda menggunakan versi ${installed}. Tiada kemas kini lebih baharu yang tersedia.`;
  for(const release of releases){
   const card=document.createElement('article');card.className='release';
   const title=document.createElement('h3');title.textContent=`${release.name||`MDE Play ${release.version}`}${release.version===installed?' · Dipasang':''}`;
   const date=document.createElement('time');date.dateTime=release.published_at||'';date.textContent=release.published_at?new Date(release.published_at).toLocaleDateString('ms-MY'):'';
   const notes=document.createElement('p');notes.textContent=release.body||'Tiada nota keluaran.';card.append(title,date,notes);
   for(const apk of apkDownloads(release))card.append(link(`Muat turun APK ${release.version} ↗`,apk.url,'button-link download'));
   if(release.html_url?.startsWith('https://github.com/KHAN7-gif/tv-signage/releases/'))card.append(link('Nota keluaran di GitHub ↗',release.html_url));
   $('releases').append(card);
  }
 }catch{
  $('releases').replaceChildren();$('update-status').textContent='Semakan gagal. Semak internet dan cuba semula, atau buka keluaran di GitHub melalui pautan bawah.';
 }finally{$('check').disabled=false}
}
$('check').onclick=check;check();
