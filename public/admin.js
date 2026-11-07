import {readConfig,configVersion,saveConfig} from './github.js';
import {validateConfig} from './media-links.js';
const $=id=>document.getElementById(id);let sha,dirty=false,busy=false,state={videos:[],images:[],ticker:''};
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
$('connect').onclick=async()=>{if(busy)return;busy=true;$('connect').disabled=true;try{const snapshot=await configVersion($('token').value.trim());const config=validateConfig(snapshot.config);sha=snapshot.sha;populate(config);$('fields').disabled=false;$('save').disabled=false;$('token').readOnly=true;$('save-status').textContent='GitHub disambungkan';notice('Tambah, edit atau padam pautan. Tekan Simpan & siarkan untuk menerbitkan perubahan.')}catch(error){notice(error.message);$('connect').disabled=false}finally{busy=false}};
$('settings').onsubmit=async e=>{e.preventDefault();if(!sha||busy)return;let config;try{config=validateConfig(state)}catch(error){notice(error.message);return}busy=true;$('save').disabled=true;$('fields').disabled=true;try{sha=await saveConfig(config,$('token').value.trim(),sha);populate(config);dirty=false;$('save-status').textContent='Semua disimpan';notice('Senarai disimpan di GitHub. TV dikemas kini selepas cache GitHub diperbaharui.');$('preview').src=`./index.html?embed=1&refresh=${Date.now()}`}catch(error){notice(error.message)}finally{busy=false;$('fields').disabled=false;$('save').disabled=false}};
readConfig().then(config=>{if(!sha){populate(validateConfig(config));$('save-status').textContent='Sambungkan GitHub untuk mengedit'}}).catch(()=>{if(!sha)$('save-status').textContent='Sambungkan GitHub untuk memuatkan tetapan'});
