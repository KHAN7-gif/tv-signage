# Maida TV Signage

Paparan TV mengandungi **tiga komponen sahaja**:

1. Senarai video **YouTube 16:9**, dimainkan mengikut urutan, berulang dan tanpa suara.
2. Senarai imej **Google Drive 9:16**, bertukar mengikut durasi setiap imej.
3. Teks bergerak.

TV: https://khan7-gif.github.io/tv-signage/

Admin: https://khan7-gif.github.io/tv-signage/admin.html

## Masukkan pautan melalui admin

1. Buka panel admin pada telefon atau komputer.
2. Masukkan GitHub fine-grained personal access token untuk repo `KHAN7-gif/tv-signage`, permission **Contents: Read and write**, kemudian tekan **Sambung GitHub**. Token hanya berada dalam memori tab.
3. Tekan **Tambah video** atau **Tambah imej** untuk menambah pautan. Edit pautan terus dalam baris tersebut; gunakan **Padam** untuk mengeluarkannya daripada senarai.
4. Tetapkan durasi imej (3–300 saat, lalai 10 saat), tulis teks bergerak, kemudian tekan **Simpan & siarkan**. Perubahan tambah/edit/padam hanya diterbitkan selepas menekan butang ini.

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

Semakan meliputi format pautan YouTube/Drive, penolakan URL luar yang tidak sah, migrasi konfigurasi lama kepada senarai, durasi imej dan perlindungan konflik GitHub. Main balik YouTube dan akses imej sebenar bergantung pada pautan pemilik dan perlu disemak pada TV.

Playlist video menggunakan parameter rasmi [YouTube Embedded Players](https://developers.google.com/youtube/player_parameters#playlist). Imej berulang mengikut urutan yang ditambah; imej yang gagal dimuatkan dicuba semula atau dilangkau ke imej seterusnya.
