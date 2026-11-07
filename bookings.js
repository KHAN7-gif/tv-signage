export function stationStatus(config, bookings, now = Date.now()) {
  if (!Array.isArray(config?.list) || !bookings || typeof bookings !== 'object' || Array.isArray(bookings)) throw Error('Invalid booking response');
  return config.list.filter(s => s.active !== false).map(s => {
    const active = Object.values(bookings).filter(b => b && String(b.sid) === String(s.id) && b.status === 'a' && new Date(b.st).getTime() <= now && new Date(b.et).getTime() > now);
    const ends = Math.max(0, ...active.map(b => new Date(b.et).getTime()));
    return {id:s.id, name:String(s.name || `Station ${s.id}`), type:String(s.type || ''), endsAt:ends ? new Date(ends).toISOString() : null};
  });
}
export async function readBookings(env) {
  if (!env.BOOKING_BASE_URL || !env.BOOKING_API_KEY) throw Error('Booking not configured');
  const base = new URL(env.BOOKING_BASE_URL);
  if (base.protocol !== 'https:' || base.username || base.password) throw Error('HTTPS required');
  const read = async path => {
    const response = await fetch(new URL(`/api/${path}`, base), {headers:{'X-API-Key':env.BOOKING_API_KEY}, redirect:'error', signal:AbortSignal.timeout(8000)});
    if (!response.ok) throw Error('Booking unavailable');
    return response.json();
  };
  const [config, bookings] = await Promise.all([read('ps_stations'), read('ps')]);
  return {stations:stationStatus(config, bookings ?? {}), updatedAt:new Date().toISOString()};
}
