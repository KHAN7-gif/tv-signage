# Maida TV Signage — Android TV

Native Android TV WebView launcher for https://khan7-gif.github.io/tv-signage/ . Package: `my.maida.signage`. Android 6.0 (API 23) or newer with an up-to-date Android System WebView.

The website displays a YouTube video, a public Google Drive image and scrolling text. The app keeps the screen awake, uses landscape fullscreen and supports TV remote navigation. Menu reloads the website; Back confirms exit. If the website fails to load, a native retry screen appears.

**Version 1.1.0** permits embedded YouTube navigation while keeping main-frame navigation restricted to this signage site. Video and image links are entered on the website admin panel. Media is not packaged into the APK. Internet is required. The app does not start automatically at TV boot.

## Install

1. Download [Maida TV Signage v1.1.0 APK](https://khan7-gif.github.io/tv-signage/public/downloads/Maida-TV-Signage-v1.1.0.apk).
2. Transfer it to the TV using USB or a file transfer app.
3. Allow **Install unknown apps** for your file manager, open the APK and install.
4. Open **Maida TV Signage** from Apps. Edit links and text from the website admin on a phone/computer.

Updates use the same signing key and package ID. Install 1.1.0 over 1.0.0; no uninstall is needed. The TV player requests autoplay with audio. If blocked, select Aktifkan audio on the TV. Admin previews remain muted. YouTube embedding, ads and availability are controlled by YouTube and each video's owner. Test your chosen links on the actual TV.

## Build and signing

Java 17, Gradle 8.9 and Android SDK 35:

```sh
cd android
gradle :app:assembleRelease :app:lintRelease
```

The **Build Android TV APK** workflow builds/lints an unsigned release, uploads it as an Actions artifact, and stages it in a draft release. Sign it outside GitHub using the original private release keystore, then distribute only the verified signed APK. The private key and password are never committed. Increase versionCode for subsequent native updates.

Validate with `apksigner verify --verbose --print-certs` and `aapt dump badging`. Actual playback and remote behavior require testing on the user's TV.
