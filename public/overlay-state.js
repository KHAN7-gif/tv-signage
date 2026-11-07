// Same labels and ten-minute threshold as Maida Legacy psOverlayStateForStation.
export function overlayState(station, now = Date.now()) {
 const remaining = Math.max(0, new Date(station.endsAt).getTime() - now);
 const busy = Boolean(station.endsAt && remaining > 0);
 const warning = busy && remaining <= 600000;
 const ms = busy ? remaining : 0;
 const time = [Math.floor(ms/3600000), Math.floor(ms%3600000/60000), Math.floor(ms%60000/1000)].map(n=>String(n).padStart(2,'0')).join(':');
 return {busy,warning,label:busy ? warning ? '10 min' : 'Online' : 'Free',time};
}
