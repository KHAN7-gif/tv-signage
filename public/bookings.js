const root = document.getElementById('booking-stations');
const sync = document.getElementById('booking-sync');
let snapshot = null, received = 0;
function unavailable(message) { snapshot = null; root.textContent = message; sync.textContent = 'Tidak tersambung'; }
function render() {
  if (!snapshot) return;
  if (Date.now() - received > 15000) return unavailable('Status lapuk · menunggu sambungan semula');
  root.replaceChildren();
  for (const station of snapshot.stations) {
    const remaining = Math.max(0, new Date(station.endsAt).getTime() - Date.now());
    const busy = station.endsAt && remaining > 0;
    const item = document.createElement('span');
    item.className = busy ? 'console busy' : 'console';
    const name = document.createElement('strong'); name.textContent = station.name;
    const status = document.createElement('small');
    const seconds = Math.floor(remaining / 1000);
    const clock = [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
    status.textContent = busy ? `● Bermain ${clock}` : '● Kosong';
    item.append(name,status); root.append(item);
  }
  if (!snapshot.stations.length) root.textContent = 'Tiada station aktif';
}
async function poll() {
  try {
    const response = await fetch('/api/bookings', {cache:'no-store',signal:AbortSignal.timeout(9000)});
    if (!response.ok) throw Error();
    const data = await response.json();
    if (!Array.isArray(data.stations)) throw Error();
    snapshot = data; received = Date.now(); sync.textContent = '● Langsung'; render();
  } catch { unavailable('Status tidak tersedia · semak sambungan PS Booking'); }
}
if (new URLSearchParams(location.search).get('demo') === '1') {
  unavailable('Sambungan PS Booking tersedia selepas konfigurasi Cloudflare');
} else { poll(); setInterval(poll,5000); setInterval(render,1000); }
