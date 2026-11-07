# Maida TV Signage

Paparan TV mengandungi **tiga komponen sahaja**:

1. Video **YouTube 16:9**, berulang dan tanpa suara.
2. Imej **Google Drive 9:16**.
3. Teks bergerak.

TV: https://khan7-gif.github.io/tv-signage/

Admin: https://khan7-gif.github.io/tv-signage/admin.html

## Masukkan pautan melalui admin

1. Buka panel admin pada telefon atau komputer.
2. Masukkan GitHub fine-grained personal access token untuk repo `KHAN7-gif/tv-signage`, permission **Contents: Read and write**, kemudian tekan **Sambung GitHub**. Token hanya berada dalam memori tab.
3. Masukkan pautan satu video YouTube dan pautan satu fail imej Google Drive.
4. Tulis teks bergerak, kemudian tekan **Simpan & siarkan**.

Video mesti membenarkan embedding. Autoplay menggunakan mod mute; YouTube masih boleh memaparkan kawalan, iklan atau mesej sekatan berdasarkan polisi video/peranti. Kandungan yang memerlukan log masuk, mempunyai sekatan umur atau embedding dimatikan mungkin tidak dimainkan.

Untuk imej Drive, gunakan JPG/PNG dan set **General access → Anyone with the link → Viewer**. Gunakan pautan `/file/d/ID/view`, bukan folder. Imej dipaparkan melalui thumbnail awam Drive; fail peribadi atau yang disekat mungkin gagal dimuatkan. Bingkai 9:16 menggunakan contain supaya keseluruhan imej kelihatan.

Medan media boleh dikosongkan. Slot yang belum dikonfigurasi hanya menunjukkan arahan ringkas; tiada contoh video atau imej pihak ketiga disiarkan secara automatik. Konfigurasi awal dikosongkan supaya pemilik memasukkan pautan sendiri dalam admin.

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

Semakan meliputi format pautan YouTube/Drive, penolakan URL luar yang tidak sah, konfigurasi tiga medan dan perlindungan konflik GitHub. Main balik YouTube dan akses imej sebenar bergantung pada pautan pemilik dan perlu disemak pada TV.
