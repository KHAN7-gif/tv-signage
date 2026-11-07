# Maida TV Signage

Paparan TV mengandungi **tiga komponen sahaja**:

1. Senarai video **YouTube 16:9**, dimainkan mengikut urutan, berulang dengan audio.
2. Senarai imej **Google Drive 9:16**, bertukar mengikut durasi setiap imej.
3. Teks bergerak.

TV: https://khan7-gif.github.io/tv-signage/

Admin: https://khan7-gif.github.io/tv-signage/admin.html

## Sambungan admin dengan token GitHub

Masukkan GitHub fine-grained personal access token untuk repo `KHAN7-gif/tv-signage` dengan permission **Contents: Read and write**, kemudian tekan **Sambung GitHub**. Tiada persediaan atau log masuk kata laluan.

Token hanya berada dalam memori tab untuk sesi semasa. Token tidak disimpan dalam localStorage, config atau repo. Muat semula halaman memerlukan token dimasukkan semula; gunakan **Putus sambungan** untuk mengosongkan token daripada sesi. Akses tersulit daripada versi lama dibuang secara automatik apabila panel baharu dibuka, tanpa memadam senarai media.

## Tambah dan kemas kini media

1. Sambungkan GitHub menggunakan token.
2. Tekan **Tambah video** atau **Tambah imej**. Edit pautan terus dalam baris tersebut; gunakan **Padam** untuk mengeluarkannya daripada senarai.
3. Tetapkan durasi imej (3–300 saat, lalai 10 saat) dan teks bergerak.
4. Tekan **Simpan & siarkan**. Perubahan tambah/edit/padam hanya diterbitkan selepas menekan butang ini.

Video mesti membenarkan embedding. Paparan TV meminta autoplay dengan audio; jika browser menyekatnya, tekan **Aktifkan audio** atau butang skrin penuh pada TV. Pratonton admin kekal mute; YouTube masih boleh memaparkan kawalan, iklan atau mesej sekatan berdasarkan polisi video/peranti. Kandungan yang memerlukan log masuk, mempunyai sekatan umur atau embedding dimatikan mungkin tidak dimainkan.

Untuk imej Drive, gunakan JPG/PNG dan set **General access → Anyone with the link → Viewer**. Gunakan pautan `/file/d/ID/view`, bukan folder. Imej dipaparkan melalui thumbnail awam Drive; fail peribadi atau yang disekat mungkin gagal dimuatkan. Bingkai 9:16 menggunakan contain supaya keseluruhan imej kelihatan.

Setiap senarai menyokong sehingga 100 pautan. Padam semua baris untuk mengosongkan slot TV. Pautan lama dalam format satu video/imej masih dibaca dan dimigrasi apabila menyimpan; tiada pautan sedia ada dipadam secara automatik. Padam dalam panel hanya mengeluarkan pautan daripada signage, bukan memadam fail asal YouTube atau Drive.

## Storan dan penerbitan

Tetapan disimpan dalam `public/config.json` di GitHub. Fail media kekal pada YouTube dan Google Drive. Pautan tidak dicetak dalam paparan TV, tetapi config repo ini awam dan boleh dibaca; jangan gunakan pautan rahsia.

GitHub Pages menggunakan **Deploy from a branch → main → / (root)**. Fail masuk root mempunyai base `./public/`; kekalkan ia sepadan dengan HTML dalam `public/`. TV menyemak konfigurasi setiap 15 saat. Cache GitHub boleh menyebabkan perubahan mengambil beberapa minit. Konflik antara dua admin akan ditolak; muat semula sebelum mengedit semula.

Kawalan skrin penuh dan tetapan muncul apabila remote/tetikus/sentuhan digunakan, kemudian tersembunyi. Paparan admin menunjukkan tetapan yang sudah disimpan, bukan perubahan yang belum disimpan.

## About / Update APK

Buka ikon ⓘ di paparan TV atau pautan **About / Update APK** di admin untuk melihat versi yang diterbitkan, nota keluaran dan pautan APK. Aplikasi Android baharu juga menyediakan About melalui Menu remote dan melaporkan versi yang dipasang. Kemas kini dipasang secara manual. Untuk versi seterusnya, lampirkan APK yang telah ditandatangani pada keluaran GitHub awam bertag `android-vX.Y.Z`; senarai About dikemas kini automatik. Binaan draf/unsigned tidak dipaparkan sebagai kemas kini.

## Android TV

Lihat [panduan Android TV](android/README.md). Aplikasi membuka URL GitHub Pages dan memerlukan internet serta Android System WebView yang dikemas kini. APK 1.1.0 menambah sokongan navigasi iframe YouTube; gunakan versi ini untuk paparan video YouTube.

## Development dan semakan

```sh
npm run dev
npm test
```

Semakan meliputi format pautan YouTube/Drive, penolakan URL luar yang tidak sah, migrasi konfigurasi lama kepada senarai, durasi imej dan perlindungan konflik GitHub serta sambungan dan pemutusan sesi token. Main balik YouTube dan akses imej sebenar bergantung pada pautan pemilik dan perlu disemak pada TV.

Playlist video menggunakan parameter rasmi [YouTube Embedded Players](https://developers.google.com/youtube/player_parameters#playlist). Imej berulang mengikut urutan yang ditambah; imej yang gagal dimuatkan dicuba semula atau dilangkau ke imej seterusnya.
