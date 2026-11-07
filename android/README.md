# Maida TV Signage — Android TV

Native Android TV WebView launcher for https://khan7-gif.github.io/tv-signage/ . Package ID: `my.maida.signage`. Android 6.0 (API 23) or newer. Landscape fullscreen, HTML5 autoplay, screen kept awake, TV remote navigation, Menu key to reload, Back key to confirm exit. A native retry screen appears if the main website fails to load. Backend status errors remain visible in the website itself.

No server, media or booking data is embedded into the APK. The website is loaded from GitHub Pages; internet and an up-to-date Android System WebView are required. Existing backend access restrictions are not bypassed by this app. Media/playlist changes do not require an APK rebuild. Updating native app code requires a new APK.

## Install on Google TV / Android TV

1. Download the [signed APK](https://khan7-gif.github.io/tv-signage/public/downloads/Maida-TV-Signage-v1.0.0.apk) from GitHub Pages on a phone/computer. The Releases page also links to the download.
2. Transfer it to the TV using USB, a local network transfer tool, or a download-capable TV browser.
3. In the TV settings, allow **Install unknown apps** for the file manager/download app you use.
4. Open the APK, install, then launch **Maida TV Signage** from the TV's Apps screen.
5. Keep the TV connected to the internet. Configure the TV's sleep/screensaver settings for the intended operating hours.

This is a sideload app, not a Play Store release. The app does not automatically start at TV boot. If an old TV cannot play a video, use MP4 H.264 and update Android System WebView/Chrome if supported by that model.

## Build

GitHub Actions workflow **Build Android TV APK** builds and lints an unsigned release APK. Its `maida-tv-signage-unsigned` artifact is for signing, not direct installation.

With Android SDK 35, Java 17 and Gradle 8.9 locally:

```sh
cd android
gradle :app:assembleRelease :app:lintRelease
```

Sign the APK with Android SDK `apksigner` using the original private release keystore and verify the signature before distributing. Keep the keystore and password outside Git; `.gitignore` excludes keystores. Increment `versionCode` for each native app update and keep the same signing key so Android can install updates without uninstalling.

The release signing key is retained privately in the task workspace and is not uploaded to this public repository. Back it up securely for future versions. Signing is performed outside GitHub Actions. The workflow stages unsigned builds in a draft release; only the verified signed APK is published for installation.

## Validation

Build/lint output is recorded in the GitHub Actions run. Verify the final APK with `apksigner verify --verbose --print-certs` and inspect package/launcher metadata with `aapt dump badging`. Actual playback, remote keys and device power behavior still require a test on the user's TV.
