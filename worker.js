const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
const defaults = { landscape: [], portrait: [], ticker: 'Selamat datang • Informasi terkini', duration: 10 };
export function validate(value) {
  if (!value || typeof value.ticker !== 'string' || value.ticker.length > 2000 || !Number.isInteger(value.duration) || value.duration < 3 || value.duration > 300) throw Error('Teks atau durasi tidak valid.');
  for (const slot of ['landscape', 'portrait']) {
    if (!Array.isArray(value[slot]) || value[slot].length > 100) throw Error('Maksimal 100 media per area.');
    for (const item of value[slot]) {
      if (!item || !['image', 'video'].includes(item.type) || typeof item.name !== 'string' || item.name.length > 200 || !/^\/media\/[a-f0-9-]+\.(jpg|png|webp|mp4|webm)$/.test(item.url)) throw Error('Media tidak valid.');
    }
  }
  return { landscape: value.landscape.map(({url,type,name})=>({url,type,name})), portrait: value.portrait.map(({url,type,name})=>({url,type,name})), ticker: value.ticker, duration: value.duration };
}
async function authorized(request, env) {
  if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length < 16) return false;
  const digest = async s => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  const [a,b] = await Promise.all([digest(request.headers.get('Authorization') || ''), digest(`Bearer ${env.ADMIN_TOKEN}`)]);
  let diff = 0; for(let i=0;i<a.length;i++) diff |= a[i]^b[i]; return diff === 0;
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/config') {
        if (request.method === 'GET') {
          const obj = await env.MEDIA.get('config.json');
          return json(obj ? await obj.json() : defaults);
        }
        if (request.method !== 'PUT') return json({error:'Metode tidak didukung'},405);
        if (!await authorized(request,env)) return json({error:'Kata sandi admin salah atau belum dikonfigurasi.'},401);
        if (Number(request.headers.get('Content-Length')) > 200000) return json({error:'Data terlalu besar'},413);
        const text = await request.text(); if(text.length > 200000) return json({error:'Data terlalu besar'},413);
        const config = validate(JSON.parse(text));
        await env.MEDIA.put('config.json',JSON.stringify(config),{httpMetadata:{contentType:'application/json'}});
        return json({ok:true});
      }
      if(url.pathname === '/api/upload' && request.method === 'POST') {
        if (!await authorized(request,env)) return json({error:'Kata sandi admin salah atau belum dikonfigurasi.'},401);
        const types = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'};
        const type = request.headers.get('Content-Type');
        if (!types[type]) return json({error:'Gunakan JPG, PNG, WebP, MP4, atau WebM.'},400);
        const size = Number(request.headers.get('Content-Length'));
        if(!size || size > 50*1024*1024) return json({error:'Batas upload 50 MB per file.'},413);
        const key = `${crypto.randomUUID()}.${types[type]}`;
        await env.MEDIA.put(key,request.body,{httpMetadata:{contentType:type}});
        return json({url:`/media/${key}`,type:type.startsWith('video')?'video':'image'});
      }
      if(url.pathname.startsWith('/media/')) {
        if(!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405});
        const key = url.pathname.slice(7);
        if(!/^[a-f0-9-]+\.(jpg|png|webp|mp4|webm)$/.test(key)) return new Response('Tidak ditemukan',{status:404});
        const obj = await env.MEDIA.get(key,{range:request.headers});
        if(!obj) return new Response('Tidak ditemukan',{status:404});
        const headers = new Headers({'Cache-Control':'public, max-age=31536000, immutable','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'});
        obj.writeHttpMetadata(headers); headers.set('ETag',obj.httpEtag);
        if(obj.range && obj.range.length) {
          headers.set('Content-Range',`bytes ${obj.range.offset}-${obj.range.offset+obj.range.length-1}/${obj.size}`);
          headers.set('Content-Length',String(obj.range.length));
        } else headers.set('Content-Length',String(obj.size));
        return new Response(request.method==='HEAD'?null:obj.body,{headers,status:obj.range?206:200});
      }
      if(url.pathname.startsWith('/api/')) return json({error:'Tidak ditemukan'},404);
      const response = await env.ASSETS.fetch(request);
      const headers = new Headers(response.headers);
      headers.set('Referrer-Policy','no-referrer'); headers.set('X-Content-Type-Options','nosniff');
      return new Response(response.body,{status:response.status,headers});
    } catch(error) {
      return json({error: error instanceof SyntaxError ? 'JSON tidak valid.' : 'Permintaan gagal. Periksa format data dan konfigurasi R2.'},400);
    }
  }
};
