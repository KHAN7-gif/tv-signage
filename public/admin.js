import {getBookingStatus} from './booking-connection.js';
import {readConfig,configVersion,saveConfig,uploadMedia} from './github.js';
import {isDemo,readDemo,saveDemo,uploadDemo,mediaSource} from './demo.js';
let config, sha, busy=false, dirty=false;
const $=id=>document.getElementById(id);
const playerURL=`./index.html${isDemo?'?demo=1':''}`;
$('tv-link').href=playerURL;
$('preview').src=playerURL+(isDemo?'&':'?')+'embed=1';
if(isDemo){$('demo-banner').hidden=false;$('access-card').hidden=true;$('mode-label').textContent='◈ Mod demo';$('save').textContent='Simpan demo ↗';$('save-help').textContent='Disimpan dalam pelayar ini sahaja.'}
function notice(message){$('notice').textContent=message;$('notice').style.display='block'}
function changed(){dirty=true;$('save-status').textContent='Belum disimpan';$('save-caption').textContent='Ada perubahan baharu'}
function updateText(){const text=$('text').value;$('char-count').textContent=`${text.length} / 2000`;$('ticker-sample').textContent=text||'Teks anda akan dipaparkan di sini'}
$('text').oninput=()=>{updateText();changed()};$('duration').oninput=changed;
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue=''}});
$('connect').onclick=async()=>{try{if(dirty)throw Error('Muat semula dan sambung GitHub sebelum mengedit playlist.');const snapshot=await configVersion($('password').value);sha=snapshot.sha;config=snapshot.config;$('text').value=config.ticker;$('duration').value=config.duration;updateText();for(const slot of ['landscape','portrait'])render(slot);$('connect').disabled=true;$('password').readOnly=true;notice('GitHub disambungkan. Muat semula halaman untuk menukar token.')}catch(e){notice(e.message)}};
function render(slot){
 const list=$(slot+'-list');list.replaceChildren();$(slot+'-count').textContent=config[slot].length;
 $('media-count').replaceChildren(document.createTextNode(String(config.landscape.length+config.portrait.length)));const unit=document.createElement('small');unit.textContent='fail';$('media-count').append(unit);
 if(!config[slot].length){const li=document.createElement('li');li.className='empty';li.textContent='Playlist kosong. Tambah media pertama anda.';list.append(li)}
 config[slot].forEach((item,index)=>{
  const li=document.createElement('li'),thumb=document.createElement(item.type==='video'?'video':'img');thumb.className='media-thumb';if(item.type==='video'){thumb.muted=true;thumb.preload='metadata'}else thumb.alt='';
  mediaSource(item.url).then(url=>{thumb.src=url}).catch(()=>{thumb.remove()});
  const title=document.createElement('span');title.className='media-title';const name=document.createElement('strong');name.textContent=item.name;name.title=item.name;const subtitle=document.createElement('small');subtitle.textContent=`${String(index+1).padStart(2,'0')} / ${item.type==='video'?'Video':'Foto'}`;title.append(name,subtitle);li.append(thumb,title);
  for(const [label,description,action,disabled] of [['↑','Naik',()=>{[config[slot][index-1],config[slot][index]]=[config[slot][index],config[slot][index-1]]},index===0],['↓','Turun',()=>{[config[slot][index+1],config[slot][index]]=[config[slot][index],config[slot][index+1]]},index===config[slot].length-1],['×','Keluarkan',()=>config[slot].splice(index,1),false]]){const button=document.createElement('button');button.textContent=label;button.disabled=disabled||busy;button.setAttribute('aria-label',`${description} ${item.name}`);button.onclick=()=>{action();changed();render(slot)};li.append(button)}list.append(li)
 });
}
function setBusy(value){busy=value;$('save').disabled=value||!config;document.querySelectorAll('[type=file]').forEach(input=>input.disabled=value||!config);if(config)for(const slot of ['landscape','portrait'])render(slot)}
for(const slot of ['landscape','portrait'])$(slot+'-upload').onchange=async event=>{
 if(!config||busy)return;
 if(!isDemo&&!sha){notice('Masukkan token GitHub dan tekan Sambung dahulu.');event.target.value='';return}
 setBusy(true);
 try{for(const file of event.target.files){if(config[slot].length>=100)throw Error('Maksimum 100 media setiap area.');if(!['image/jpeg','image/png','image/webp','video/mp4','video/webm'].includes(file.type))throw Error(`${file.name}: format tidak disokong. Gunakan JPG, PNG, WebP, MP4 atau WebM.`);if(file.size>20*1024*1024)throw Error(`${file.name}: melebihi 20 MB.`);notice(`Menambah ${file.name}…`);const media=isDemo?await uploadDemo(file):await uploadMedia(file,$('password').value);config[slot].push({...media,name:file.name.slice(0,200)});changed()}notice('Media ditambah. Simpan untuk mengemas kini pratonton.')}catch(error){notice(error.message)}finally{setBusy(false);event.target.value=''}
};
$('save').onclick=async()=>{
 if(!config||busy)return;const duration=Number($('duration').value);if(!Number.isInteger(duration)||duration<3||duration>300){notice('Durasi foto mestilah antara 3 hingga 300 saat.');$('duration').focus();return}
 setBusy(true);
 try{config.ticker=$('text').value;config.duration=duration;if(isDemo)await saveDemo(config);else sha=await saveConfig(config,$('password').value,sha);dirty=false;$('save-status').textContent='Semua disimpan';$('save-caption').textContent=isDemo?'Demo telah disimpan':'Playlist telah disiarkan';$('preview').src=playerURL+(isDemo?'&':'?')+'embed=1';notice(isDemo?'Demo disimpan dalam pelayar ini. Pratonton telah dikemas kini.':'Disimpan di GitHub. TV menerima perubahan selepas cache GitHub dikemas kini, biasanya beberapa minit.')}catch(error){notice(error.message)}finally{setBusy(false)}
};
(async()=>{setBusy(true);try{config=isDemo?await readDemo():await readConfig();$('text').value=config.ticker;$('duration').value=config.duration;updateText();$('save-status').textContent='Semua disimpan'}catch{notice('Konfigurasi GitHub belum tersedia. Pastikan perubahan sudah digabungkan ke main.');$('save-status').textContent='Belum tersambung'}finally{setBusy(false)}})();

$('test-booking').onclick=async()=>{
 $('test-booking').disabled=true;$('booking-result').textContent='Menyemak sambungan…';
 try{if(!config?.bookingStatusUrl)throw Error('URL status belum dikonfigurasi.');const data=await getBookingStatus(config.bookingStatusUrl);$('booking-result').textContent=`Berjaya: ${data.stations.length} station diterima.`}
 catch(error){$('booking-result').textContent=error.message}
 finally{$('test-booking').disabled=false}
};
