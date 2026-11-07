import {readConfig,configVersion,saveConfig} from './github.js?v=token-only-1';
import {validateConfig} from './media-links.js?v=covers-2';
import {moveItem,attachReorderHandle} from './reorder.js?v=reorder-1';
const $=id=>document.getElementById(id);let activeToken='',sha,dirty=false,busy=false,state={videos:[],images:[],ticker:''};
const notice=text=>$('notice').textContent=text;
function changed(){dirty=true;$('save-status').textContent='Belum disimpan'}
function reorder(kind,from,to){
 if(!sha||busy||!moveItem(state[kind],from,to))return;
 changed();render(kind);const prefix=kind==='videos'?'video':'image';
 const handle=$(`${prefix}-sort-${to}`);handle.focus({preventScroll:true});handle.scrollIntoView({block:'nearest'});
 notice(`${kind==='videos'?'Video':'Imej'} ${from+1} dipindahkan ke kedudukan ${to+1}. Tekan Simpan & siarkan untuk menerbitkan susunan.`);
}
function render(kind,focusIndex=-1){
 const video=kind==='videos',prefix=video?'video':'image',title=video?'Video':'Imej';const list=$(prefix+'-list');list.replaceChildren();$(prefix+'-count').textContent=state[kind].length;
 if(!state[kind].length){const empty=document.createElement('p');empty.className='empty-list';empty.textContent=`Belum ada ${video?'video':'imej'}. Tekan Tambah ${video?'video':'imej'} untuk bermula.`;list.append(empty)}
 state[kind].forEach((item,index)=>{
  const row=document.createElement('div');row.className='media-row';
  const heading=document.createElement('div');heading.className='media-row-heading';const name=document.createElement('strong');name.textContent=`${title} ${index+1}`;
  const remove=document.createElement('button');remove.type='button';remove.className='delete-media';remove.textContent='Padam';remove.setAttribute('aria-label',`Padam ${title.toLowerCase()} ${index+1}`);remove.onclick=()=>{state[kind].splice(index,1);changed();render(kind);($(prefix+'-url-'+Math.min(index,state[kind].length-1))||$('add-'+prefix)).focus()};const handle=document.createElement('button');handle.type='button';handle.className='sort-handle';handle.id=`${prefix}-sort-${index}`;handle.textContent='⠿';handle.title='Seret untuk susun; guna ↑ atau ↓ pada keyboard';handle.setAttribute('aria-label',`Susun ${title} ${index+1}`);handle.setAttribute('aria-describedby','reorder-help');
  const actions=document.createElement('div');actions.className='row-actions';
  for(const [offset,text,description] of [[-1,'↑','Naikkan'],[1,'↓','Turunkan']]){const button=document.createElement('button');button.type='button';button.className='move-media';button.textContent=text;button.disabled=index+offset<0||index+offset>=state[kind].length;button.setAttribute('aria-label',`${description} ${title} ${index+1}`);button.onclick=()=>reorder(kind,index,index+offset);actions.append(button)}
  actions.append(remove);heading.append(handle,name,actions);
  attachReorderHandle(handle,row,index,{list,canMove:()=>Boolean(sha)&&!busy,onMove:(from,to)=>reorder(kind,from,to),label:`${title} ${index+1}`});
  const input=document.createElement('input');input.type='url';input.value=item.url;input.required=true;input.id=`${prefix}-url-${index}`;input.placeholder=video?'https://youtu.be/…':'https://drive.google.com/file/d/…/view';input.setAttribute('aria-label',`Pautan ${title.toLowerCase()} ${index+1}`);input.oninput=()=>{item.url=input.value;changed()};
  row.append(heading,input);
  if(video){
   const coverLabel=document.createElement('label');coverLabel.htmlFor=`video-cover-${index}`;coverLabel.className='cover-label';coverLabel.textContent='Pautan imej cover (pilihan)';
   const cover=document.createElement('input');cover.type='url';cover.id=coverLabel.htmlFor;cover.value=item.coverUrl||'';cover.placeholder='https://gmedia.playstation.com/…';cover.setAttribute('aria-label',`Pautan imej cover Video ${index+1}`);
   const help=document.createElement('small');help.className='field-note';help.textContent='Tampal pautan terus imej dari PlayStation (Copy image address), bukan pautan halaman game. Kosongkan untuk menyembunyikan cover video ini.';
   const preview=document.createElement('div');preview.className='cover-preview';let timer,request=0;
   const show=()=>{const version=++request;preview.replaceChildren();const value=cover.value.trim();if(!value)return;let parsed;try{parsed=new URL(value)}catch{return}if(parsed.protocol!=='https:')return;
    const image=document.createElement('img');image.alt=`Pratonton cover Video ${index+1}`;image.referrerPolicy='no-referrer';
    image.onload=()=>{if(version===request)preview.replaceChildren(image)};
    image.onerror=()=>{if(version===request)preview.textContent='Imej tidak dapat dibuka. Semak pautan terus dan akses imej.'};image.src=value;
   };
   cover.oninput=()=>{item.coverUrl=cover.value;changed();clearTimeout(timer);request++;preview.replaceChildren();timer=setTimeout(show,400)};
   const soonLabel=document.createElement('label');soonLabel.className='coming-soon-option';soonLabel.htmlFor=`video-coming-soon-${index}`;
   const soon=document.createElement('input');soon.type='checkbox';soon.id=soonLabel.htmlFor;soon.checked=item.comingSoon===true;soon.onchange=()=>{item.comingSoon=soon.checked;if(soon.checked){item.isNew=false;fresh.checked=false}changed()};
   const soonText=document.createElement('span');soonText.textContent='COMING SOON';soonLabel.append(soon,soonText);
   const newLabel=document.createElement('label');newLabel.className='coming-soon-option new-option';newLabel.htmlFor=`video-new-${index}`;
   const fresh=document.createElement('input');fresh.type='checkbox';fresh.id=newLabel.htmlFor;fresh.checked=item.isNew===true;fresh.onchange=()=>{item.isNew=fresh.checked;if(fresh.checked){item.comingSoon=false;soon.checked=false}changed()};
   const newText=document.createElement('span');newText.textContent='NEW';newLabel.append(fresh,newText);
   const options=document.createElement('div');options.className='video-label-options';options.append(soonLabel,newLabel);
   const soonHelp=document.createElement('small');soonHelp.className='field-note';soonHelp.textContent='Pilih COMING SOON atau NEW untuk memaparkan label di luar kotak imej. Kosongkan kedua-dua pilihan untuk menyembunyikan teks.';
   row.append(coverLabel,cover,help,preview,options,soonHelp);show();
  }
  if(!video){const durationRow=document.createElement('div');durationRow.className='duration-row';const label=document.createElement('label');label.htmlFor=`image-duration-${index}`;label.textContent='Durasi (saat)';const duration=document.createElement('input');duration.id=label.htmlFor;duration.type='number';duration.min=3;duration.max=300;duration.required=true;duration.value=item.duration;duration.setAttribute('aria-label',`Durasi imej ${index+1}`);duration.oninput=()=>{item.duration=Number(duration.value);changed()};durationRow.append(label,duration);row.append(durationRow)}
  list.append(row);
 });
 $(prefix==='video'?'add-video':'add-image').disabled=state[kind].length>=100;
 if(focusIndex>=0)$(`${prefix}-url-${focusIndex}`)?.focus();
}
function populate(config){state=config;$('festival').checked=config.festival==='deepavali';render('videos');render('images');$('ticker').value=config.ticker;$('counter').textContent=`${config.ticker.length} / 2000`}
for(const [button,kind] of [['add-video','videos'],['add-image','images']])$(button).onclick=()=>{if(!sha||busy||state[kind].length>=100)return;state[kind].push(kind==='videos'?{url:''}:{url:'',duration:10});changed();render(kind,state[kind].length-1)};
$('festival').onchange=()=>{state.festival=$('festival').checked?'deepavali':'off';changed()};
$('ticker').oninput=()=>{state.ticker=$('ticker').value;changed();$('counter').textContent=`${state.ticker.length} / 2000`};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
// Remove the retired encrypted credential only; leave media settings and other browser data alone.
try{localStorage.removeItem('maida-signage:KHAN7-gif/tv-signage:admin-vault:v1')}catch{}
function friendlyError(error){if(error.status===401)return 'Token GitHub tidak sah atau telah tamat tempoh. Gunakan token baharu.';if(error.status===403)return 'GitHub menolak akses. Semak permission Contents: Read and write untuk repo tv-signage.';return error.message;}
function connection(connected){$('token').readOnly=connected;$('connect').disabled=connected;$('disconnect').hidden=!connected;$('token').placeholder=connected?'GitHub disambungkan untuk sesi ini':'Fine-grained personal access token';$('token-status').textContent=connected?'Sambungan aktif. Token hanya dalam memori tab sehingga halaman dimuat semula atau sambungan diputuskan.':'Token hanya digunakan dalam memori tab ini. Hadkan akses kepada repo tv-signage dengan Contents: Read and write.';}
$('token-form').onsubmit=async e=>{
 e.preventDefault();if(busy||activeToken)return;
 const token=$('token').value.trim();if(!token){notice('Masukkan token GitHub.');return;}
 busy=true;$('connect').disabled=true;$('token').disabled=true;
 try{const snapshot=await configVersion(token);const config=validateConfig(snapshot.config);activeToken=token;sha=snapshot.sha;populate(config);$('token').value='';connection(true);$('fields').disabled=false;$('save').disabled=false;$('save-status').textContent='GitHub disambungkan';notice('Tambah, edit atau padam pautan, kemudian tekan Simpan & siarkan.');}
 catch(error){notice(friendlyError(error));$('connect').disabled=false;}
 finally{busy=false;$('token').disabled=false;}
};
$('disconnect').onclick=()=>{
 if(busy)return;
 if(dirty&&!confirm('Perubahan belum disimpan akan dibuang daripada panel ini. Putuskan sambungan?'))return;
 activeToken='';sha=undefined;dirty=false;$('token').value='';connection(false);$('fields').disabled=true;$('save').disabled=true;$('save-status').textContent='Sambungkan GitHub untuk mengedit';notice('Sambungan diputuskan. Media yang telah disimpan dikekalkan.');$('token').focus();
};
$('settings').onsubmit=async e=>{e.preventDefault();if(!sha||busy)return;let config;try{config=validateConfig(state)}catch(error){notice(error.message);return}busy=true;$('save').disabled=true;$('fields').disabled=true;try{sha=await saveConfig(config,activeToken,sha);populate(config);dirty=false;$('save-status').textContent='Semua disimpan';notice('Senarai disimpan di GitHub. TV dikemas kini selepas cache GitHub diperbaharui.');$('preview').src=`./index.html?embed=1&refresh=${Date.now()}`}catch(error){notice(friendlyError(error))}finally{busy=false;$('fields').disabled=false;$('save').disabled=false}};
readConfig().then(config=>{if(!sha){populate(validateConfig(config));$('save-status').textContent='Sambungkan GitHub untuk mengedit'}}).catch(()=>{if(!sha)$('save-status').textContent='Sambungkan GitHub untuk memuatkan tetapan'});
