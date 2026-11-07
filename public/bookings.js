import {getBookingStatus} from './booking-connection.js';
import {overlayState} from './overlay-state.js';
let endpoint='';
window.addEventListener('signage-config',e=>{const next=e.detail.bookingStatusUrl||'';if(endpoint!==next){endpoint=next;poll()}});
const root = document.getElementById('booking-stations');
const sync = document.getElementById('booking-sync');
let snapshot = null, received = 0, pending = false;
function connection(connected,label){sync.className='connection-dot '+(connected?'connected':'disconnected');sync.textContent='';sync.setAttribute('aria-label',label);sync.title=label}
function unavailable(message) { snapshot = null; root.replaceChildren();const text=document.createElement('span');text.className='booking-message';text.textContent=message;root.append(text);connection(false,'Tidak tersambung'); }
function render() {
  if (!snapshot) return;
  if (Date.now() - received > 15000) return unavailable('Menyambung semula…');
  root.replaceChildren();
  const total=snapshot.stations.length;
  const columns=matchMedia('(max-aspect-ratio: 1/1)').matches?3:6;
  root.style.gridTemplateRows=`repeat(${Math.max(1,Math.ceil(total/columns))},minmax(0,1fr))`;
  for (const station of snapshot.stations) {
    const state=overlayState(station);
    const item = document.createElement('span');
    item.className = 'console'+(state.busy?' busy':'')+(state.warning?' warning':'');
    const number=document.createElement('strong');number.className='console-number';number.textContent=station.id;
    const type=document.createElement('span');type.className='console-type';type.textContent=(station.type || station.name || 'STATION').toUpperCase();
    item.setAttribute('aria-label',`${station.name || type.textContent} · Station ${station.id}`);
    const status=document.createElement('span');status.className='console-status';
    const label=document.createElement('span');label.textContent=`● ${state.label}`;
    const clock=document.createElement('time');clock.textContent=state.time;
    status.append(label,clock);item.append(number,type,status);root.append(item);
  }
  if (!snapshot.stations.length) root.textContent = 'Tiada station aktif';
  connection(true,'Status langsung');
}
async function poll() {
  if(pending || !endpoint)return;
  pending=true;const requested=endpoint;
  try {
    const data=await getBookingStatus(requested);
    if(requested!==endpoint)return;
    snapshot=data;received=Date.now();render();
  } catch(error) {
    if(requested===endpoint){unavailable('Status konsol tidak tersedia');sync.title=error.message;sync.setAttribute('aria-label',error.message);}
  } finally {pending=false;}
}
if (new URLSearchParams(location.search).get('demo') === '1') {
  unavailable('Sambungan PS Booking tersedia selepas sambungan Maida Legacy diaktifkan');
} else { poll(); setInterval(poll,5000); setInterval(render,1000); }

window.addEventListener('resize',render);
