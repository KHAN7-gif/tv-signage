export class BookingConnectionError extends Error {
 constructor(code,message){super(message);this.code=code;}
}
export async function getBookingStatus(endpoint,{fetchImpl=globalThis.fetch,timeoutMs=9000}={}) {
 let url;
 try{url=new URL(endpoint);if(url.protocol!=='https:')throw Error();}
 catch{throw new BookingConnectionError('config','URL status mesti menggunakan HTTPS.');}
 const controller=typeof AbortController==='function'?new AbortController():null;
 let timer;
 const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{reject(new BookingConnectionError('timeout','Pelayan status tidak memberi respons.'));controller?.abort();},timeoutMs)});
 try{
  const response=await Promise.race([fetchImpl(url,{cache:'no-store',...(controller?{signal:controller.signal}:{})}),deadline]);
  if(response.status===403)throw new BookingConnectionError('blocked','Hostinger menyekat API (403). Semak Bot Verification untuk /display-api/status.');
  if(!response.ok)throw new BookingConnectionError('http',`API status memulangkan HTTP ${response.status}. Semak deployment Maida Legacy.`);
  const text=await response.text();let data;
  try{data=JSON.parse(text)}catch{
   throw new BookingConnectionError('html',/bot verification/i.test(text)?'Hostinger memulangkan Bot Verification, bukan data status.':'Endpoint memulangkan halaman web, bukan JSON. Redeploy backend Maida Legacy.');
  }
  if(!Array.isArray(data?.stations)||!data.stations.every(s=>s&&s.id!=null&&typeof s.name==='string'&&(s.endsAt===null||(typeof s.endsAt==='string'&&Number.isFinite(Date.parse(s.endsAt))))))throw new BookingConnectionError('format','Format JSON status tidak sah.');
  return data;
 }catch(error){
  if(error instanceof BookingConnectionError)throw error;
  throw new BookingConnectionError('network','Tidak dapat membaca API dari GitHub Pages. Semak sambungan, Bot Verification dan CORS di Hostinger.');
 }finally{clearTimeout(timer)}
}
