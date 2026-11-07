import {overlayState} from './overlay-state.js';
let endpoint='';
window.addEventListener('signage-config',e=>{const next=e.detail.bookingStatusUrl||'';if(endpoint!==next){endpoint=next;poll()}});
const root = document.getElementById('booking-stations');
const sync = document.getElementById('booking-sync');
let snapshot = null, received = 0;
function unavailable(message) { snapshot = null; root.textContent = message; sync.textContent = 'Tidak tersambung'; }
function render() {
  if (!snapshot) return;
  if (Date.now() - received > 15000) return unavailable('Status lapuk · menunggu sambungan semula');
  root.replaceChildren();
  let free=0,active=0,warn=0;
  for (const station of snapshot.stations) {
    const state=overlayState(station);
    if(state.busy)active++;else free++;
    if(state.warning)warn++;
    const item = document.createElement('span');
    item.className = 'console'+(state.busy?' busy':'')+(state.warning?' warning':'');
    const name = document.createElement('strong'); name.textContent = `${station.type ? station.type.toUpperCase()+' · ' : ''}${station.name}`;
    const status = document.createElement('small');
    status.textContent = `● ${state.label} ${state.time}`;
    item.append(name,status); root.append(item);
  }
  if (!snapshot.stations.length) root.textContent = 'Tiada station aktif';
  sync.textContent=`${free} Free · ${active} Online · ${warn} ≤10 min · ${snapshot.stations.length} station`;
}
async function poll() {
  try {
    if(!endpoint) return unavailable('URL status booking belum dikonfigurasi');
    const url=new URL(endpoint);if(url.protocol!=='https:')throw Error();
    const response = await fetch(url, {cache:'no-store',signal:AbortSignal.timeout(9000)});
    if (!response.ok) throw Error();
    const data = await response.json();
    if (!Array.isArray(data.stations)) throw Error();
    snapshot = data; received = Date.now(); sync.textContent = '● Langsung'; render();
  } catch { unavailable('Status tidak tersedia · semak sambungan PS Booking'); }
}
if (new URLSearchParams(location.search).get('demo') === '1') {
  unavailable('Sambungan PS Booking tersedia selepas sambungan Maida Legacy diaktifkan');
} else { poll(); setInterval(poll,5000); setInterval(render,1000); }
