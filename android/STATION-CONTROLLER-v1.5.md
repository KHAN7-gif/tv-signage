# MDE Play v1.5 — Station Controller (Preview)

Status: **source-code preview / not yet a signed or TV-tested APK**.

## Existing functionality retained
- GitHub Pages signage (YouTube 16:9, Google Drive images 9:16, news ticker)
- Admin media playlist, ordering, covers, labels, festival theme
- MDE Play Android app name, artwork, package ID `my.maida.signage`
- Version bumped to `1.5.0`, versionCode 7

## New controller
- Native foreground `StationService` listens on port 8765 in the local network
- Staff open `http://TV_IP:8765` in Safari on the same Wi-Fi
- Six-digit one-time session PIN displayed at **TV remote Menu → Station Controller / iPhone**
- START SESSION: records PLAYING, cancels any pending timer
- END SESSION: records WAITING; choose 1, 3, 5, or 10 minutes
- DISPLAY NOW: attempts to foreground MDE Play
- Live station status; wrong PIN throttling; no credentials in GitHub Pages
- One TV/server represents one station; a fleet landing page on any station at `http://TV_IP:8765/fleet` links to up to 12 TV controllers

## Limitations and security
**IMPORTANT:** Android TV normally does not grant ordinary third-party apps access to force HDMI input selection. START SESSION currently only records the state; staff must use the Xiaomi remote to select HDMI. Android 10+ may block launching the app from a background service, meaning DISPLAY NOW / timer expiry can require staff to reopen MDE Play from the TV notification or remote. Do not advertise this build as full HDMI automation. Avoid changing source inputs while customers are playing.

This is a LAN-only HTTP prototype (not TLS). Only connect it to a trusted private Wi-Fi/VLAN, never expose port 8765 to the internet. Keep the pairing PIN private. Rotate PIN by restarting the service. Foreground service behavior and Android 15 restrictions must be tested on the actual Mi TV P1. Android may pause/kill services, so timer durability across app force-stop and reboot is not guaranteed.

## Test procedure
1. Build Android app using Java 17 / Android SDK 35: `cd android && gradle :app:assembleDebug`.
2. Install the debug build for initial tests. A debug build **cannot update** an existing production-signed APK in place; use an isolated test TV or a matching production signing key for upgrade.
3. Open MDE Play; press Menu → Station Controller / iPhone to find IP/PIN.
4. Connect iPhone Safari on same Wi-Fi to `http://<TV-IP>:8765`.
5. Verify START / END and countdown. While HDMI is selected, wait for timer and test whether Mi TV P1 allows app to appear.
6. Record whether HDMI-to-app launch succeeds. If it does not, a remote/ADB companion or approved device-management method is necessary.
7. Test reboot, sleep/wake, unplugging internet, multiple stations and PIN lockout before release.

## Release
Do not publish `android-v1.5.0` or replace the signed v1.4.1 release until Android build, physical TV testing, and production signing have succeeded. The original release keystore is required to upgrade the existing APK without uninstalling.

## 12 PlayStation stations (fleet)
1. Install the same v1.5 APK on each of the 12 Xiaomi TVs (after release build and signing).
2. On each TV: remote **Menu → Tetapkan Station 01-12**, select unique station number. This is stored on that TV.
3. In TV **Menu → Station Controller / iPhone**, note its LAN IP and six-digit PIN.
4. On iPhone Safari, visit `http://<any-TV-IP>:8765/fleet` and enter the 12 private IPv4 addresses. Safari stores IPs locally on that iPhone, not in the public GitHub repo.
5. Tap **Buka Controller** on any station card. Pair with that TV's PIN; use Start Session / End Session / timer.
6. Keep fixed DHCP reservations in the router, preferably a restricted staff VLAN.

The fleet landing page is a navigation dashboard, **not yet a consolidated live 12-TV monitoring and remote-control API**. Each card opens the selected TV's own secured controller. This intentionally avoids browser CORS and exposing PINs centrally. A future unified status/control dashboard requires a properly authenticated hub service, not an insecure public GitHub Pages controller.

The TV numbering is independent of the IP's last octet; never assume Station 01 is .101, etc. Any example address displayed in the UI is only a placeholder.
