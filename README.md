# TV Signage

Aplikasi digital signage untuk Google TV dengan admin melalui Safari di iPhone. Kod disimpan di GitHub; aplikasi berjalan di Cloudflare Workers dan foto/video serta playlist disimpan di Cloudflare R2.

## Ciri versi awal

- Layar landscape utama, portrait sebelah kanan, teks berjalan seperti referensi.
- Upload JPG, PNG, WebP, MP4, WebM, maksimum 50 MB/file.
- Dua playlist terpisah, ubah urutan dan keluarkan media dari playlist.
- Kata sandi admin; TV membaca perubahan setiap 15 saat.
- Video tanpa suara untuk autoplay, foto berganti sesuai durasi.
- Sokongan HTTP Range untuk video. Satu konfigurasi bersama untuk semua TV.

## Mulakan di komputer

Pasang Node.js 22 atau lebih baru, lalu jalankan:

```sh
npm install
cp .dev.vars.example .dev.vars
```

Ubah `ADMIN_TOKEN` dalam `.dev.vars` menjadi kata sandi acak sekurang-kurangnya 16 karakter. Jangan unggah file `.dev.vars` ke GitHub.

```sh
npm run dev
```

Wrangler menyediakan R2 lokal untuk development. Buka URL lokal yang tertera, dan `/admin.html` untuk admin. Penyimpanan lokal terpisah dari Cloudflare produksi.

## GitHub dahulu

1. Di GitHub buat repositori baru bernama `tv-signage` (private disarankan), tanpa README otomatis.
2. Upload seluruh isi folder proyek ini melalui **Add file → Upload files**, atau gunakan Git di komputer:

```sh
git init
git add .
git commit -m "Build TV signage with Cloudflare R2"
git branch -M main
git remote add origin https://github.com/USERNAME/tv-signage.git
git push -u origin main
```

GitHub menyimpan kod sumber. GitHub Pages tidak menjalankan backend R2 atau admin aplikasi ini. Deploy ke Cloudflare untuk penggunaan sebenar.

## Pasang di Cloudflare

Aktifkan R2 dalam akun Cloudflare terlebih dahulu (akun mungkin meminta billing).

```sh
npx wrangler login
npx wrangler r2 bucket create tv-signage-media
npx wrangler secret put ADMIN_TOKEN
npm run deploy
```

Masukkan kata sandi acak minimal 16 karakter saat diminta. Tidak perlu meletakkan credential Cloudflare dalam kod. Nama bucket harus sesuai dengan `wrangler.jsonc`; jika bucket sudah ada, gunakan bucket tersebut dan lewati perintah create. Perintah deploy menampilkan alamat `https://tv-signage.<subdomain>.workers.dev`.

## Gunakan di iPhone

Buka `https://ALAMAT-APLIKASI/admin.html` di Safari. Masukkan kata sandi admin, upload media ke area yang dipilih, atur urutan dan teks, lalu tekan **Simpan & siarkan**. Upload sahaja belum mengubah playlist TV. Jika Safari tidak mengenali format video, gunakan MP4 H.264. HEIC dan MOV perlu dikonversi terlebih dahulu.

## Gunakan di Google TV

Pasang browser yang tersedia untuk model Google TV anda dan mendukung video HTML5, lalu buka alamat aplikasi. Tekan **Mulakan layar penuh** menggunakan remote. Jika TV tidak mempunyai browser yang sesuai, perlu aplikasi Android TV/WebView khusus; versi ini adalah aplikasi web dan bukan APK. Coba pada model TV sebenar untuk memastikan autoplay, fullscreen, dan remote berfungsi. Pengaturan tidur/screensaver TV perlu disesuaikan untuk operasi berterusan.

## Batas versi awal

- Playlist dan URL media dapat dibaca publik; gunakan untuk konten publik, bukan dokumen rahasia. Hanya perubahan dan upload memerlukan kata sandi.
- Jangan bagikan kata sandi admin. Kata sandi hanya berada di memori tab, dan diminta kembali setelah reload.
- Mengeluarkan media dari playlist tidak menghapus objek R2. Hapus file yang tidak digunakan melalui dashboard Cloudflare untuk mengendalikan penggunaan storage.
- Jaringan diperlukan. Saat koneksi terputus, pemutar mencoba kembali dan mempertahankan playlist aktif; tidak menjamin pemutaran offline setelah reload atau jika file belum dimuat.
- Belum termasuk jadwal kalender, pengelolaan banyak layar, APK, atau sinkronisasi Google Drive.
- Jika dua admin menyimpan bersamaan, penyimpanan terakhir berlaku.

## Verifikasi

```sh
npm test
```

Test mencakup validasi playlist, proteksi perubahan admin, penyimpanan dan pembacaan konfigurasi, penolakan upload, serta respons byte-range. Uji perangkat asli dan deploy R2 memerlukan akun Cloudflare dan TV pengguna.

## Pratonton UI tanpa Cloudflare

Jalankan server statik dari folder projek:

```sh
python3 -m http.server 8080 --directory public
```

Buka `http://localhost:8080/admin.html?demo=1` untuk studio demo atau `http://localhost:8080/index.html?demo=1` untuk pemutar. Contoh media SVG disertakan. Upload demo disimpan dalam IndexedDB pelayar, bukan cloud. Pratonton terbenam menunjukkan playlist selepas disimpan. Data demo hanya dikongsi antara tab dengan origin dan pelayar yang sama; iPhone dan TV tidak disegerakkan. Mod demo tidak memerlukan kata laluan dan tidak menyediakan akses cloud. Menghapus data pelayar akan membuang demo. Guna localhost atau HTTPS untuk sokongan API pelayar.

UI ini belum diterbitkan ke GitHub Pages atau Cloudflare.
