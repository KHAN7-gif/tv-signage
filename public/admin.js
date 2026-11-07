import {encryptToken,decryptToken,hasStoredAccess,readStoredAccess,storeAccess,forgetAccess} from './admin-vault.js?v=password-1';
import {readConfig,configVersion,saveConfig} from './github.js?v=password-1';
import {validateConfig} from './media-links.js?v=playlist-1';
const $=id=>document.getElementById(id);let activeToken='',sha,dirty=false,busy=false,state={videos:[],images:[],ticker:''};
const notice=text=>$('notice').textContent=text;
function changed(){dirty=true;$('save-status').textContent='Belum disimpan'}
function render(kind,focusIndex=-1){
 const video=kind==='videos',prefix=video?'video':'image',title=video?'Video':'Imej';const list=$(prefix+'-list');list.replaceChildren();$(prefix+'-count').textContent=state[kind].length;
 if(!state[kind].length){const empty=document.createElement('p');empty.className='empty-list';empty.textContent=`Belum ada ${video?'video':'imej'}. Tekan Tambah ${video?'video':'imej'} untuk bermula.`;list.append(empty)}
 state[kind].forEach((item,index)=>{
  const row=document.createElement('div');row.className='media-row';
  const heading=document.createElement('div');heading.className='media-row-heading';const name=document.createElement('strong');name.textContent=`${title} ${index+1}`;
  const remove=document.createElement('button');remove.type='button';remove.className='delete-media';remove.textContent='Padam';remove.setAttribute('aria-label',`Padam ${title.toLowerCase()} ${index+1}`);remove.onclick=()=>{state[kind].splice(index,1);changed();render(kind);($(prefix+'-url-'+Math.min(index,state[kind].length-1))||$('add-'+prefix)).focus()};heading.append(name,remove);
  const input=document.createElement('input');input.type='url';input.value=item.url;input.required=true;input.id=`${prefix}-url-${index}`;input.placeholder=video?'https://youtu.be/…':'https://drive.google.com/file/d/…/view';input.setAttribute('aria-label',`Pautan ${title.toLowerCase()} ${index+1}`);input.oninput=()=>{item.url=input.value;changed()};
  row.append(heading,input);
  if(!video){const durationRow=document.createElement('div');durationRow.className='duration-row';const label=document.createElement('label');label.htmlFor=`image-duration-${index}`;label.textContent='Durasi (saat)';const duration=document.createElement('input');duration.id=label.htmlFor;duration.type='number';duration.min=3;duration.max=300;duration.required=true;duration.value=item.duration;duration.setAttribute('aria-label',`Durasi imej ${index+1}`);duration.oninput=()=>{item.duration=Number(duration.value);changed()};durationRow.append(label,duration);row.append(durationRow)}
  list.append(row);
 });
 $(prefix==='video'?'add-video':'add-image').disabled=state[kind].length>=100;
 if(focusIndex>=0)$(`${prefix}-url-${focusIndex}`)?.focus();
}
function populate(config){state=config;render('videos');render('images');$('ticker').value=config.ticker;$('counter').textContent=`${config.ticker.length} / 2000`}
for(const [button,kind] of [['add-video','videos'],['add-image','images']])$(button).onclick=()=>{if(!sha||busy||state[kind].length>=100)return;state[kind].push(kind==='videos'?{url:''}:{url:'',duration:10});changed();render(kind,state[kind].length-1)};
$('ticker').oninput=()=>{state.ticker=$('ticker').value;changed();$('counter').textContent=`${state.ticker.length} / 2000`};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
function authView(mode){for(const name of ['setup','login','unlocked'])$('auth-'+name).hidden=name!==mode;}
function clearPasswords(){for(const id of ['setup-token','new-password','confirm-password','login-password'])$(id).value='';}
function authBusy(value){for(const id of ['setup-submit','login-submit','reset-access','setup-token','new-password','confirm-password','login-password'])$(id).disabled=value;}
function friendlyError(error){if(error.status===401)return 'Token GitHub tidak sah atau telah tamat tempoh. Tetapkan semula akses dengan token baharu.';if(error.status===403)return 'GitHub menolak akses. Semak permission Contents: Read and write pada token atau tetapkan semula akses.';return error.message;}
function unlock(token,snapshot){const config=validateConfig(snapshot.config);activeToken=token;sha=snapshot.sha;populate(config);$('fields').disabled=false;$('save').disabled=false;clearPasswords();authView('unlocked');$('save-status').textContent='Admin dibuka';notice('Sedia mengedit. Tekan Simpan & siarkan selepas membuat perubahan.');}
function lock(){
 if(busy)return;
 if(dirty&&!confirm('Perubahan belum disimpan akan dibuang daripada panel ini. Kunci admin?'))return;
 activeToken='';sha=undefined;dirty=false;$('fields').disabled=true;$('save').disabled=true;clearPasswords();authView(hasStoredAccess()?'login':'setup');$('save-status').textContent='Log masuk untuk mengedit';notice('Admin dikunci.');
}
$('setup-form').onsubmit=async e=>{
 e.preventDefault();if(busy)return;
 if($('new-password').value!==$('confirm-password').value){notice('Kata laluan tidak sepadan.');return;}
 busy=true;authBusy(true);
 try{
  const token=$('setup-token').value.trim(),password=$('new-password').value;
  const snapshot=await configVersion(token);validateConfig(snapshot.config);
  const encrypted=await encryptToken(token,password);storeAccess(encrypted);unlock(token,snapshot);
 }catch(error){notice(friendlyError(error));$('new-password').value='';$('confirm-password').value='';}
 finally{busy=false;authBusy(false);}
};
$('login-form').onsubmit=async e=>{
 e.preventDefault();if(busy)return;busy=true;authBusy(true);
 try{const token=await decryptToken(readStoredAccess(),$('login-password').value);const snapshot=await configVersion(token);unlock(token,snapshot)}
 catch(error){notice(friendlyError(error));$('login-password').value='';$('login-password').focus();}
 finally{busy=false;authBusy(false);}
};
$('lock-admin').onclick=lock;
$('reset-access').onclick=()=>{
 if(busy||!confirm('Padam akses tersimpan pada pelayar ini? Anda perlu token GitHub sekali lagi untuk menetapkan kata laluan baharu. Senarai media tidak dipadam.'))return;
 try{forgetAccess();activeToken='';sha=undefined;dirty=false;clearPasswords();$('fields').disabled=true;$('save').disabled=true;authView('setup');$('save-status').textContent='Buat persediaan akses admin';notice('Akses setempat dipadam. Media dan tetapan GitHub dikekalkan.');}
 catch{notice('Akses setempat tidak dapat dipadam pada pelayar ini.');}
};
try{authView(hasStoredAccess()?'login':'setup')}catch{authView('setup');notice('Benarkan storan pelayar untuk menyimpan akses admin.');}
$('settings').onsubmit=async e=>{e.preventDefault();if(!sha||busy)return;let config;try{config=validateConfig(state)}catch(error){notice(error.message);return}busy=true;$('save').disabled=true;$('fields').disabled=true;try{sha=await saveConfig(config,activeToken,sha);populate(config);dirty=false;$('save-status').textContent='Semua disimpan';notice('Senarai disimpan di GitHub. TV dikemas kini selepas cache GitHub diperbaharui.');$('preview').src=`./index.html?embed=1&refresh=${Date.now()}`}catch(error){notice(friendlyError(error))}finally{busy=false;$('fields').disabled=false;$('save').disabled=false}};
readConfig().then(config=>{if(!sha){populate(validateConfig(config));$('save-status').textContent='Log masuk admin untuk mengedit'}}).catch(()=>{if(!sha)$('save-status').textContent='Log masuk admin untuk memuatkan tetapan'});
