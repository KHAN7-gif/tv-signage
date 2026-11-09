package my.maida.signage;

import android.app.*;
import android.content.*;
import android.os.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.concurrent.*;
import org.json.JSONObject;

/**
 * MDE Play v1.5 LAN-only iPhone controller.
 * Does not require ADB for station state/timer. Android does not guarantee
 * background app launches or third-party HDMI input switching.
 */
public final class StationService extends Service {
    public static final int PORT = 8765;
    public static volatile String pairingPin = "";
    public static volatile String state = "DISPLAY";
    public static volatile long deadline = 0;
    public static volatile String message = "MDE Play sedia";
    public static volatile int stationNumber = 1;
    private static final String CHANNEL = "mde_station";
    private ServerSocket socket;
    private ExecutorService workers;
    private Thread acceptThread;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private int failures = 0;
    private long blockedUntil = 0;
    private final Runnable tick = new Runnable() {
        @Override public void run() {
            if ("WAITING".equals(state) && System.currentTimeMillis() >= deadline) {
                state = "DISPLAY"; deadline = 0;
                requestSignage();
            }
            handler.postDelayed(this, 1000);
        }
    };
    @Override public void onCreate() {
        super.onCreate();
        stationNumber = Math.max(1, Math.min(12, getSharedPreferences("station", MODE_PRIVATE).getInt("number", 1)));
        pairingPin = String.format(java.util.Locale.US, "%06d", new SecureRandom().nextInt(1000000));
        NotificationManager nm = (NotificationManager)getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26) nm.createNotificationChannel(
            new NotificationChannel(CHANNEL, "MDE Play Station", NotificationManager.IMPORTANCE_DEFAULT));
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(this, 1, open,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26
            ? new Notification.Builder(this, CHANNEL) : new Notification.Builder(this);
        b.setSmallIcon(android.R.drawable.ic_media_play).setContentTitle("MDE Play Station Controller")
            .setContentText("LAN port 8765 • buka aplikasi untuk kod pairing")
            .setContentIntent(pi).setOngoing(true);
        startForeground(15, b.build());
        workers = Executors.newFixedThreadPool(3);
        handler.post(tick);
        acceptThread = new Thread(() -> {
            try (ServerSocket server = new ServerSocket()) {
                socket = server;
                server.setReuseAddress(true);
                server.bind(new InetSocketAddress(PORT));
                while (!Thread.currentThread().isInterrupted()) {
                    Socket c = server.accept();
                    c.setSoTimeout(4000);
                    workers.execute(() -> handle(c));
                }
            } catch (IOException e) { message = "LAN server tidak tersedia: " + e.getMessage(); }
        }, "mde-station-server");
        acceptThread.start();
    }
    private void requestSignage() {
        message = "Sesi tamat. Cuba buka MDE Play; jika Android sekat, tekan notifikasi MDE Play pada TV.";
        Intent open = new Intent(this, MainActivity.class);
        open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        try { startActivity(open); } catch (Exception e) { message = "Android menghalang auto-launch: " + e.getClass().getSimpleName(); }
    }
    private static String esc(String s) {
        return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\"","&quot;");
    }
    private String page() {
        return "<!doctype html><html lang='ms'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>MDE Play Controller</title>"
          +"<style>*{box-sizing:border-box}body{font:16px system-ui;background:#111217;color:white;margin:0;padding:24px;max-width:580px;margin:auto}small{color:#aaa}header{display:flex;align-items:center;justify-content:space-between}b{color:#ed168b}.card{background:#202127;border:1px solid #393942;border-radius:18px;padding:20px;margin:20px 0}.status{font-weight:800;font-size:30px;margin:14px 0}button,input{font:inherit;border-radius:12px;padding:14px}button{width:100%;border:0;background:#d30d78;color:white;font-weight:700;margin:6px 0}button.alt{background:#363741}input{width:100%;background:#111;color:white;border:1px solid #555}label{display:block;margin:16px 0 6px}p{line-height:1.5}</style>"
          +"<header><h2>MDE <b>PLAY</b></h2><small>STATION " + String.format(java.util.Locale.US, "%02d", stationNumber) + " · v1.5</small></header><p><a style='color:#f69fd0' href='/fleet'>12 Station Dashboard →</a></p>"
          +"<div class='card'><small>XIAOMI TV · STATUS</small><div class='status' id='status'>CONNECTING</div><p id='detail'>Menyambung...</p></div>"
          +"<div class='card'><label>Kod pairing (lihat Menu di TV)</label><input id='pin' inputmode='numeric' maxlength='6' type='password' placeholder='6-digit PIN' autocomplete='off'>"
          +"<label>Auto Display Delay</label><select id='delay' style='width:100%;padding:14px;background:#111;color:white;border-radius:12px'><option value='1'>1 minit</option><option value='3'>3 minit</option><option value='5' selected>5 minit</option><option value='10'>10 minit</option></select>"
          +"<button onclick=\"cmd('end')\">END SESSION · MULAKAN TIMER</button><button class='alt' onclick=\"cmd('start')\">START SESSION · BATAL TIMER</button><button class='alt' onclick=\"cmd('display')\">BUKA MDE PLAY SEKARANG</button><p id='notice'></p></div>"
          +"<p><small>START menandakan sesi aktif tetapi pertukaran HDMI automatik tidak tersedia kepada aplikasi Android biasa. Gunakan remote Input TV jika diperlukan. Jangan dedahkan kod pairing.</small></p>"
          +"<script>let pin='';async function cmd(action){pin=document.getElementById('pin').value.trim();try{const r=await fetch('/api/'+action,{method:'POST',headers:{'Content-Type':'application/json','X-Station-Pin':pin},body:JSON.stringify({delay:Number(document.getElementById('delay').value)})});const v=await r.json();document.getElementById('notice').textContent=v.message||v.error||'Selesai';refresh()}catch(e){document.getElementById('notice').textContent='Sambungan gagal'}}"
          +"async function refresh(){try{const r=await fetch('/api/status');const v=await r.json();document.getElementById('status').textContent=v.state;document.getElementById('detail').textContent=(v.remainingSeconds?'Baki '+v.remainingSeconds+' saat. ':'')+v.message}catch(e){document.getElementById('detail').textContent='TV tidak dapat dihubungi'}}refresh();setInterval(refresh,2000)</script></html>";
    }
    /**
     * Fleet dashboard stores local TV IPs only in the iPhone browser.
     * Opening a card navigates to that TV's own authenticated controller,
     * avoiding insecure CORS and permanent credential storage.
     */
    private String fleetPage() {
        return "<!doctype html><html lang='ms'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
          +"<title>MDE Play | 12 Stations</title><style>"
          +":root{color-scheme:dark}*{box-sizing:border-box}body{font:15px system-ui;background:#101115;color:#fff;max-width:960px;margin:auto;padding:22px}"
          +"header{display:flex;align-items:center;justify-content:space-between;gap:8px}h1{font-size:24px;margin:6px 0}small,.hint{color:#aeb0bb}"
          +".grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:22px}"
          +".card{background:#1d1e24;border:1px solid #34353d;border-radius:16px;padding:16px}.tag{font-size:11px;color:#f5a7d0;font-weight:700}"
          +"label{display:block;color:#bfc0c9;margin:14px 0 5px}input{width:100%;background:#101115;color:white;border:1px solid #51515b;border-radius:9px;padding:11px;font-size:15px}"
          +"a.open{display:block;text-align:center;padding:12px;background:#c90a71;color:#fff;font-weight:700;text-decoration:none;border-radius:10px;margin-top:12px}"
          +"a.disabled{opacity:.4;pointer-events:none;background:#51515b}.top{color:#ff99cc;text-decoration:none}.note{background:#242029;padding:14px;border-radius:12px;margin-top:20px}"
          +"</style></head><body><header><div><small>MDE PLAY / GAMING HUB</small><h1>Station Controller <span style='color:#ea188c'>12</span></h1></div>"
          +"<a class='top' href='/'>TV Controller</a></header>"
          +"<p class='hint'>Set alamat IP bagi setiap Xiaomi TV. Tekan Buka untuk kawal sesi stesen tersebut. PlayStation kekal ON.</p>"
          +"<div class='grid' id='grid'></div><p class='note'><small>Alamat disimpan pada Safari peranti ini sahaja. PIN pairing dimasukkan terus pada TV yang dipilih. "
          +"Tiada kawalan pukal atau status silang-TV dalam versi ini. Pastikan semua TV dalam Wi-Fi/LAN yang sama.</small></p>"
          +"<script>const root=document.getElementById('grid');const saved=JSON.parse(localStorage.getItem('mde_fleet_ips')||'{}');"
          +"for(let n=1;n<=12;n++){const num=String(n).padStart(2,'0');const card=document.createElement('section');card.className='card';"
          +"const tag=document.createElement('div');tag.className='tag';tag.textContent='PLAYSTATION '+num;"
          +"const label=document.createElement('label');label.textContent='IP Xiaomi TV';"
          +"const input=document.createElement('input');input.placeholder='192.168.1.'+(100+n);input.value=saved[n]||'';input.autocomplete='off';input.inputMode='decimal';"
          +"const a=document.createElement('a');a.className='open';a.textContent='Buka Controller';"
          +"const refresh=()=>{const ip=input.value.trim();const ok=/^(?:(?:25[0-5]|2[0-4]\\d|1?\\d{1,2})\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d{1,2})$/.test(ip);"
          +"a.href=ok?'http://'+ip+':8765/':'#';a.className=ok?'open':'open disabled';"
          +"if(ok)saved[n]=ip;else delete saved[n];localStorage.setItem('mde_fleet_ips',JSON.stringify(saved));};"
          +"input.addEventListener('input',refresh);card.append(tag,label,input,a);root.append(card);refresh();}</script></body></html>";
    }
    private void handle(Socket client) {
        try (Socket c = client; InputStream in = c.getInputStream(); OutputStream out = c.getOutputStream()) {
            BufferedReader r = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
            String first = r.readLine(); if (first == null) return;
            String[] p = first.split(" "); if (p.length < 2) return;
            String method = p[0], path = p[1];
            String supplied = ""; int length = 0;
            for (String line; (line=r.readLine()) != null && !line.isEmpty();) {
                int colon=line.indexOf(':'); if(colon<0)continue;
                String key=line.substring(0,colon).trim();
                String val=line.substring(colon+1).trim();
                if (key.equalsIgnoreCase("X-Station-Pin")) supplied=val;
                if (key.equalsIgnoreCase("Content-Length")) try {length=Math.min(1024,Integer.parseInt(val));}catch(Exception ignored){}
            }
            char[] buf = new char[Math.max(0,length)]; int read=0;
            while(read<buf.length){int n=r.read(buf,read,buf.length-read); if(n<0)break; read+=n;}
            String body = new String(buf,0,read);
            int code=200; String response; String mime="application/json";
            if ("GET".equals(method) && "/".equals(path)) {response=page();mime="text/html; charset=utf-8";}
            else if ("GET".equals(method) && "/fleet".equals(path)) {response=fleetPage();mime="text/html; charset=utf-8";}
            else if ("GET".equals(method) && "/api/status".equals(path)) {
                long remain="WAITING".equals(state)?Math.max(0,(deadline-System.currentTimeMillis()+999)/1000):0;
                response=new JSONObject().put("station",stationNumber).put("state",state).put("remainingSeconds",remain).put("message",message).toString();
            } else if ("POST".equals(method) && path.startsWith("/api/")) {
                long now=System.currentTimeMillis();
                if (now<blockedUntil || !pairingPin.equals(supplied)) {
                    code=403; failures++; if (failures>=5){blockedUntil=now+60000;failures=0;}
                    response="{\"error\":\"PIN salah atau dikunci sementara\"}";
                } else {
                    failures=0;
                    String action=path.substring(5);
                    if ("start".equals(action)) {
                        state="PLAYING";deadline=0;
                        message="Sesi aktif. Pilih input HDMI PlayStation dengan remote jika diperlukan.";
                    } else if ("end".equals(action)) {
                        int mins=5;try{mins=new JSONObject(body).optInt("delay",5);}catch(Exception ignored){}
                        mins=(mins==1||mins==3||mins==5||mins==10)?mins:5;
                        deadline=System.currentTimeMillis()+mins*60000L;
                        state="WAITING"; message="Timer berjalan.";
                    } else if ("display".equals(action)) {
                        state="DISPLAY"; deadline=0; handler.post(this::requestSignage);
                    } else {code=404;}
                    response=new JSONObject().put("message",code==200?message:"Arahan tidak dikenali").toString();
                }
            } else {code=404;response="{\"error\":\"Not found\"}";}
            byte[] bytes=response.getBytes(StandardCharsets.UTF_8);
            String head="HTTP/1.1 "+code+" "+(code==200?"OK":code==403?"Forbidden":"Not Found")+"\r\nContent-Type: "+mime+"\r\nContent-Length: "+bytes.length+"\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n";
            out.write(head.getBytes(StandardCharsets.US_ASCII));out.write(bytes);out.flush();
        } catch(Exception ignored) {}
    }
    @Override public int onStartCommand(Intent intent,int flags,int startId){return START_STICKY;}
    @Override public android.os.IBinder onBind(Intent intent){return null;}
    @Override public void onDestroy(){handler.removeCallbacks(tick);try{if(socket!=null)socket.close();}catch(Exception ignored){}if(workers!=null)workers.shutdownNow();if(acceptThread!=null)acceptThread.interrupt();super.onDestroy();}
}