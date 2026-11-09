# MDE Play — Android TV

Native Android TV WebView launcher for https://khan7-gif.github.io/tv-signage/ . Package: `my.maida.signage`. Android 6.0 (API 23) or newer with an up-to-date Android System WebView.

The website displays a YouTube video, a public Google Drive image and scrolling text. The app keeps the screen awake, uses landscape fullscreen and supports TV remote navigation. Menu reloads the website; Back confirms exit. If the website fails to load, a native retry screen appears.

**Version 1.1.0** permits embedded YouTube navigation while keeping main-frame navigation restricted to this signage site. Video and image links are entered on the website admin panel. Media is not packaged into the APK. Internet is required. The app does not start automatically at TV boot.

## Native update (1.4.1)

Version 1.4.1 (versionCode 6) applies the approved minimal MDE Play branding: regular-weight text on a plain magenta background. Both TV banner and app icon use the same approved artwork. It retains the original package and signing certificate for in-place upgrades; all signage data is unchanged.

## Native update (1.4.0)

Version 1.4.0 (versionCode 5) renames the app to **MDE Play** and uses the supplied magenta MDE Play artwork for the TV banner and app icon. Package ID `my.maida.signage`, original signing certificate and signage content are unchanged. Install as an update to Maida TV without uninstalling. Earlier release descriptions below retain their original branding for history.

## Native update (1.3.0)

Version 1.3.0 (versionCode 4) uses the approved dark Maida emblem + tv branding with a subtle iridescent finish. The Android TV banner fills the 16:9 launcher tile; the square app icon centers the same artwork without cropping. The package ID, original signing key, app name, remote controls, website URL and all signage content are unchanged. Install directly over earlier versions without uninstalling.

## Native update (1.2.0)

Version 1.2.0 (versionCode 3) is named **Maida TV** and uses the supplied black, white and magenta logo for the app icon and Android TV banner. The original image is packaged unchanged. The release adds About / Update APK with installed-version reporting and manual update links. It uses the same package ID and original release signing key as 1.1.0; install directly over the old APK without uninstalling.

## About / Update APK

Press Menu on the TV remote and select **About / Update APK**, or select the ⓘ link on the TV page. About displays the installed package version when opened by the updated app, fetches published stable Android releases from GitHub, and links to available APKs and release notes. The same About link is available in admin. Draft releases and unsigned APK assets are excluded. Previously published 1.0.0/1.1.0 downloads remain on Pages. Future signed APKs should be attached to the corresponding published `android-vX.Y.Z` release. Downloads open in an external browser; installation remains manual. TVs without a browser can use a phone/computer and USB. The original 1.1.0 APK can view the web About page, but native version reporting and external-download handling require the updated signed APK.

## Install

1. Download [MDE Play v1.4.1 APK](https://khan7-gif.github.io/tv-signage/public/downloads/MDE-Play-v1.4.1.apk).
2. Transfer it to the TV using USB or a file transfer app.
3. Allow **Install unknown apps** for your file manager, open the APK and install.
4. Open **MDE Play** from Apps. Edit links and text from the website admin on a phone/computer.

Updates use the same signing key and package ID. Install 1.4.1 over earlier MDE Play or Maida TV versions; no uninstall is needed. The TV player requests autoplay with audio. If blocked, select Aktifkan audio on the TV. Admin previews remain muted. YouTube embedding, ads and availability are controlled by YouTube and each video's owner. Test your chosen links on the actual TV.

## Build and signing

Java 17, Gradle 8.9 and Android SDK 35:

```sh
cd android
gradle :app:assembleRelease :app:lintRelease
```

The **Build Android TV APK** workflow builds/lints an unsigned release, uploads it as an Actions artifact, and stages it in a draft release. Sign it outside GitHub using the original private release keystore, then distribute only the verified signed APK. The private key and password are never committed. Increase versionCode for subsequent native updates.

Validate with `apksigner verify --verbose --print-certs` and `aapt dump badging`. Actual playback and remote behavior require testing on the user's TV.
