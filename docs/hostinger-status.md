# Aktifkan status PS Booking di Hostinger

Kod status sudah digabungkan ke `KHAN7-gif/maidalegacy`, branch `main` (commit `19757d2`). Repo `tv-signage` ialah paparan TV; repo `maidalegacy` ialah backend data.

1. Log masuk ke https://hpanel.hostinger.com/ .
2. Buka Websites dan dashboard aplikasi `royalblue-oryx-448762.hostingersite.com`.
3. Buka Deployments → Redeploy. Untuk sumber GitHub, pastikan repo **KHAN7-gif/maidalegacy**, branch **main**.
4. Untuk aplikasi Node.js ini, fail masuk ialah `server/index.js`, arahan mula `npm start`, dan root repo ialah `/`. Kekalkan nilai database serta `API_SHARED_KEY` yang sedia ada; jangan salin rahsia ke chat atau GitHub. Jangan jalankan migrasi database semula untuk perubahan endpoint ini.
5. Sahkan tetapan, tekan Redeploy dan tunggu selesai. Jika aplikasi asal dipasang menggunakan ZIP, pilih Upload new files dengan sumber repo terkini; pilihan Use previous files tidak mengambil perubahan GitHub.
6. Buka https://royalblue-oryx-448762.hostingersite.com/display-api/status . Hasil mestilah JSON yang mempunyai `stations`. Contoh struktur sahaja: `{"stations":[{"id":1,"name":"Station 1","type":"PS5","endsAt":null}]}`.
7. Buka panel admin signage → **Uji sambungan** untuk mengesahkan JSON boleh dibaca dari origin GitHub Pages. Membuka endpoint di tab sahaja tidak mengesahkan CORS.
8. Tutup dan buka semula APK TV. APK baharu tidak diperlukan.

Jika menu Deployments atau Redeploy tiada, semak sama ada website itu benar-benar dipasang sebagai Node.js Web App. Mengupload HTML ke hosting statik sahaja tidak menjalankan `server/index.js`.

## Jika keluar Bot Verification / 403

Dapatkan bantuan Hostinger melalui chat hPanel untuk menyemak sekatan pada endpoint sahaja. Teks untuk dihantar sendiri:

> API baca sahaja saya `https://royalblue-oryx-448762.hostingersite.com/display-api/status` memulangkan HTTP 403 / Bot Verification. Ia digunakan oleh aplikasi Android TV dan frontend `https://khan7-gif.github.io`. Tolong semak dan benarkan permintaan GET ke endpoint ini tanpa cabaran JavaScript/CAPTCHA, sambil mengekalkan perlindungan laman lain. Endpoint perlu memulangkan JSON dengan header `Access-Control-Allow-Origin: https://khan7-gif.github.io`.

Jika JSON memulangkan 503, semak log Node.js dan sambungan MySQL; itu ralat backend, bukan susun atur TV. Jika HTML aplikasi utama dipulangkan, semak deployment/entry file dan laluan `/display-api`.

Panduan rasmi Hostinger: https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/ .
