# Maida TV Signage

Paparan TV mengandungi **tiga komponen sahaja**:

1. Senarai video **YouTube 16:9**, dimainkan mengikut urutan, berulang dan tanpa suara.
2. Senarai imej **Google Drive 9:16**, bertukar mengikut durasi setiap imej.
3. Teks bergerak.

TV: https://khan7-gif.github.io/tv-signage/

Admin: https://khan7-gif.github.io/tv-signage/admin.html

## Log masuk admin dengan kata laluan

Pada **persediaan pertama sahaja bagi setiap pelayar/peranti**, masukkan token GitHub fine-grained untuk repo `KHAN7-gif/tv-signage` (Contents: Read and write), cipta kata laluan sekurang-kurangnya 10 aksara dan sahkan kata laluan. Tekan **Simpan akses & masuk**.

Untuk lawatan seterusnya pada pelayar yang sama, masukkan **kata laluan sahaja**. Token disimpan dalam localStorage sebagai ciphertext AES-256-GCM; kunci diperoleh daripada kata laluan melalui PBKDF2-SHA256 dengan salt rawak dan 600,000 iterasi. Kata laluan tidak disimpan atau dihantar ke GitHub. Token yang dibuka hanya digunakan dalam memori sesi dan dihantar kepada GitHub API untuk perubahan repo; ia tidak dimasukkan ke config atau repo awam.

Kata laluan ini membuka akses setempat, bukan akaun/server log masuk bersama. Pelayar/peranti baharu, mod peribadi atau pembersihan data pelayar memerlukan persediaan token sekali lagi. Gunakan Safari/Chrome biasa untuk mengekalkan akses. Token yang tamat tempoh atau dibatalkan perlu diganti melalui **Lupa kata laluan / tukar token**. Menetapkan semula akses hanya memadam ciphertext pada pelayar itu; media di GitHub tidak dipadam. Gunakan **Kunci admin** untuk menamatkan sesi mengedit.

## Tambah dan kemas kini media

1. Log masuk dengan kata laluan.
2. Tekan **Tambah video** atau **Tambah imej**. Edit pautan terus dalam baris tersebut; gunakan **Padam** untuk mengeluarkannya daripada senarai.
3. Tetapkan durasi imej (3–300 saat, lalai 10 saat) dan teks bergerak.
4. Tekan **Simpan & siarkan**. Perubahan tambah/edit/padam hanya diterbitkan selepas menekan butang ini.

Video mesti membenarkan embedding. Autoplay menggunakan mod mute; YouTube masih boleh memaparkan kawalan, iklan atau mesej sekatan berdasarkan polisi video/peranti. Kandungan yang memerlukan log masuk, mempunyai sekatan umur atau embedding dimatikan mungkin tidak dimainkan.

Untuk imej Drive, gunakan JPG/PNG dan set **General access → Anyone with the link → Viewer**. Gunakan pautan `/file/d/ID/view`, bukan folder. Imej dipaparkan melalui thumbnail awam Drive; fail peribadi atau yang disekat mungkin gagal dimuatkan. Bingkai 9:16 menggunakan contain supaya keseluruhan imej kelihatan.

Setiap senarai menyokong sehingga 100 pautan. Padam semua baris untuk mengosongkan slot TV. Pautan lama dalam format satu video/imej masih dibaca dan dimigrasi apabila menyimpan; tiada pautan sedia ada dipadam secara automatik. Padam dalam panel hanya mengeluarkan pautan daripada signage, bukan memadam fail asal YouTube atau Drive.

## Storan dan penerbitan

Tetapan disimpan dalam `public/config.json` di GitHub. Fail media kekal pada YouTube dan Google Drive. Pautan tidak dicetak dalam paparan TV, tetapi config repo ini awam dan boleh dibaca; jangan gunakan pautan rahsia.

GitHub Pages menggunakan **Deploy from a branch → main → / (root)**. Fail masuk root mempunyai base `./public/`; kekalkan ia sepadan dengan HTML dalam `public/`. TV menyemak konfigurasi setiap 15 saat. Cache GitHub boleh menyebabkan perubahan mengambil beberapa minit. Konflik antara dua admin akan ditolak; muat semula sebelum mengedit semula.

Kawalan skrin penuh dan tetapan muncul apabila remote/tetikus/sentuhan digunakan, kemudian tersembunyi. Paparan admin menunjukkan tetapan yang sudah disimpan, bukan perubahan yang belum disimpan.

## Android TV

Lihat [panduan Android TV](android/README.md). Aplikasi membuka URL GitHub Pages dan memerlukan internet serta Android System WebView yang dikemas kini. APK 1.1.0 menambah sokongan navigasi iframe YouTube; gunakan versi ini untuk paparan video YouTube.

## Development dan semakan

```sh
npm run dev
npm test
```

Semakan meliputi format pautan YouTube/Drive, penolakan URL luar yang tidak sah, migrasi konfigurasi lama kepada senarai, durasi imej dan perlindungan konflik GitHub serta enkripsi, kata laluan salah dan reset akses setempat. Main balik YouTube dan akses imej sebenar bergantung pada pautan pemilik dan perlu disemak pada TV.

Playlist video menggunakan parameter rasmi [YouTube Embedded Players](https://developers.google.com/youtube/player_parameters#playlist). Imej berulang mengikut urutan yang ditambah; imej yang gagal dimuatkan dicuba semula atau dilangkau ke imej seterusnya.
