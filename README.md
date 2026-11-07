# Maida Legacy TV Signage — GitHub Pages

Media, playlist dan tetapan disimpan dalam repo **KHAN7-gif/tv-signage**. Paparan 16:9, 9:16, teks berjalan, panel admin iPhone, dan status PS Booking terus daripada **https://royalblue-oryx-448762.hostingersite.com**.

## Terbitkan

1. Gabungkan perubahan ini ke `main`.
2. GitHub repo → Settings → Pages → Source: **Deploy from a branch**, branch **main**, folder **/ (root)**.
3. GitHub Pages menerbitkan semula secara automatik selepas commit ke main.
4. TV: https://khan7-gif.github.io/tv-signage/
5. Admin: https://khan7-gif.github.io/tv-signage/admin.html

Fail masuk root menggunakan aset dalam `public/`; kekalkan kedua-duanya sepadan apabila mengubah HTML. URL tersedia selepas proses Pages berjaya. Repo ini awam, jadi semua media dan playlist juga awam.

## Simpan dari admin

Cipta GitHub **fine-grained personal access token** dengan akses hanya repo `tv-signage` dan permission **Contents: Read and write**. Masukkan ke panel admin dan tekan **Sambung GitHub sebelum mengedit**. Token kekal dalam memori tab; tidak disimpan dalam localStorage, config atau repo. Masukkan hanya pada halaman admin milik anda.

Upload JPG, PNG, WebP, MP4 atau WebM (maksimum **20 MB/fail**). Setiap upload ialah commit media di `public/media/`. Susun playlist, tetapkan teks dan durasi, kemudian **Simpan & siarkan** untuk commit `public/config.json`. Mengeluarkan media daripada playlist tidak memadam fail/histori Git. Elakkan video panjang atau upload kerap kerana saiz sejarah repo bertambah; GitHub Pages mempunyai had saiz/bandwidth dan bukan storan video berskala besar.

TV membaca config dan media daripada branch `main` melalui raw GitHub. Semakan playlist setiap 15 saat, tetapi cache GitHub boleh melambatkan perubahan beberapa minit. Konflik semasa admin lain menyimpan akan ditolak; muat semula sebelum mengedit semula. Jangan edit tanpa menyambungkan GitHub dahulu.

## Status langsung Maida Legacy

TV membaca `https://royalblue-oryx-448762.hostingersite.com/display-api/status` setiap 5 saat. Ini sambungan terus ke hosting Maida Legacy. Status pelanggan/tempahan kekal dalam MySQL Maida Legacy; GitHub hanya menyimpan media dan tetapan signage.

Laluan status belum tersedia pada hosting ketika semakan. Untuk mengaktifkannya di repo **KHAN7-gif/maidalegacy**:

1. Salin `integrations/maidalegacy/display-status.cjs` ke `server/display-status.cjs`.
2. Dalam `server/index.js`, sebelum middleware `/api`, tambah:

```js
app.use('/display-api', apiRateLimit, require('./display-status.cjs'));
```

3. Deploy semula aplikasi Maida Legacy di hosting sedia ada.

Endpoint awam ini hanya mendedahkan ID/nama/jenis station dan masa tamat sesi. Tiada nama pelanggan, bayaran atau kunci API. CORS dibenarkan untuk `https://khan7-gif.github.io`. Station tidak aktif dikecualikan. Booking mesti berstatus `a`, sudah bermula dan belum tamat. Apabila sambungan gagal, TV memaparkan status tidak tersedia, bukan semua konsol kosong.

## Development dan semakan

```sh
npm run dev
npm test
```

Pratonton statik: http://localhost:8080 . Untuk cuba upload tanpa menulis GitHub, gunakan `/admin.html?demo=1`; demo kekal pada pelayar ini sahaja. Status produksi pada localhost disekat CORS; gunakan domain GitHub Pages untuk sambungan sebenar.

Video autoplay tanpa suara. Tekan Mulakan layar penuh pada TV. Ujian Google TV sebenar dan sambungan MySQL produksi masih diperlukan. GitHub Pages perlu diaktifkan pada repo.

## Susun atur status TV

PS Booking memaparkan semua station dalam grid enam lajur pada TV (12 station = dua baris), termasuk eRacing. Pada paparan menegak, grid menggunakan tiga lajur. Kad hanya memaparkan nombor station, jenis konsol, status dan baki masa. Kawalan ikon skrin penuh/tetapan muncul apabila remote, tetikus atau sentuhan digunakan, kemudian tersembunyi selepas 2.5 saat. Data ujian untuk semakan grid tidak disimpan dalam konfigurasi produksi.

## APK Android TV

Versi Android TV tersedia sebagai APK pemasangan terus. Lihat [panduan Android TV](android/README.md) untuk pemasangan, binaan dan keperluan peranti. Laman web kekal di GitHub Pages; aplikasi hanya membukanya dalam paparan TV.
