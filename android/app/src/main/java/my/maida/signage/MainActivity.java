package my.maida.signage;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final String HOME = "https://khan7-gif.github.io/tv-signage/";
    private final Handler handler = new Handler(Looper.getMainLooper());
    private WebView web;
    private LinearLayout offline;
    private boolean failed;
    private View fullscreenView;
    private FrameLayout frame;
    private WebChromeClient.CustomViewCallback fullscreenCallback;
    private final Runnable retry = () -> { if (failed) openHome(); };

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        frame = new FrameLayout(this);
        frame.setBackgroundColor(Color.rgb(3, 12, 27));
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(3, 12, 27));
        web.setFocusable(true);
        web.setFocusableInTouchMode(true);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportZoom(false);
        if (android.os.Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);
        frame.addView(web, new FrameLayout.LayoutParams(-1, -1));
        offline = new LinearLayout(this);
        offline.setOrientation(LinearLayout.VERTICAL);
        offline.setGravity(Gravity.CENTER);
        offline.setPadding(40, 40, 40, 40);
        offline.setBackgroundColor(Color.rgb(3, 12, 27));
        TextView message = new TextView(this);
        message.setText("MDE PLAY\n\nTiada sambungan ke signage.\nSemak Wi-Fi. Mencuba semula secara automatik.");
        message.setTextSize(22);
        message.setTextColor(Color.WHITE);
        message.setGravity(Gravity.CENTER);
        offline.addView(message);
        Button again = new Button(this);
        again.setText("Cuba semula");
        again.setOnClickListener(v -> openHome());
        offline.addView(again);
        frame.addView(offline, new FrameLayout.LayoutParams(-1, -1));
        offline.setVisibility(View.GONE);
        setContentView(frame);
        web.setDownloadListener((url, userAgent, disposition, mime, length) -> openExternal(Uri.parse(url)));
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request.isForMainFrame() && handleAboutLink(request.getUrl())) return true;
                return request.isForMainFrame() ? !allowed(request.getUrl()) : !allowedFrame(request.getUrl());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Uri uri = Uri.parse(url);
                if (handleAboutLink(uri)) return true;
                return !allowed(uri) && !allowedFrame(uri);
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) {
                failed = false;
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (!failed) { offline.setVisibility(View.GONE); web.requestFocus(); }
                immersive();
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showOffline();
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (request.isForMainFrame() && response.getStatusCode() >= 400) showOffline();
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onShowCustomView(View view, CustomViewCallback callback) {
                if (fullscreenView != null) { callback.onCustomViewHidden(); return; }
                fullscreenView = view; fullscreenCallback = callback;
                frame.addView(view, new FrameLayout.LayoutParams(-1,-1)); immersive();
            }
            @Override public void onHideCustomView() { closeFullscreen(); }
        });
        immersive(); openHome();
        try { androidxPlaceholder(); } catch (Exception ignored) {}
    }
    private void androidxPlaceholder() {
        Intent service = new Intent(this, StationService.class);
        if (android.os.Build.VERSION.SDK_INT >= 26) startForegroundService(service);
        else startService(service);
    }
    private void chooseStationNumber() {
        String[] choices = new String[12];
        for (int i = 0; i < 12; i++) choices[i] = String.format(java.util.Locale.US, "Station %02d", i + 1);
        int selected = getSharedPreferences("station", MODE_PRIVATE).getInt("number", 1) - 1;
        new AlertDialog.Builder(this).setTitle("Tetapkan nombor Xiaomi TV")
            .setSingleChoiceItems(choices, selected, (dialog, which) -> {
                getSharedPreferences("station", MODE_PRIVATE).edit().putInt("number", which + 1).apply();
                StationService.stationNumber = which + 1;
                dialog.dismiss(); openStationInfo();
            }).setNegativeButton("Batal", null).show();
    }
    private void openStationInfo() {
        String ip = "TV-IP";
        try {
            java.util.Enumeration<java.net.NetworkInterface> interfaces = java.net.NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                java.net.NetworkInterface network = interfaces.nextElement();
                java.util.Enumeration<java.net.InetAddress> addresses = network.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    java.net.InetAddress address = addresses.nextElement();
                    if (address instanceof java.net.Inet4Address && !address.isLoopbackAddress()) { ip = address.getHostAddress(); break; }
                }
                if (!"TV-IP".equals(ip)) break;
            }
        } catch (Exception ignored) {}
        new AlertDialog.Builder(this).setTitle("MDE Play Station Controller v1.5")
            .setMessage("Buka pada Safari iPhone (Wi-Fi yang sama):\\nhttp://" + ip + ":8765\\n\\nKod pairing: " + StationService.pairingPin + "\\n\\nJangan kongsi PIN. Android mungkin menyekat auto-buka dan input HDMI.")
            .setPositiveButton("Tutup", (d,w) -> immersive()).show();
    }
    private String installedVersion() {
        try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; }
        catch (PackageManager.NameNotFoundException error) { return ""; }
    }
    private void openAbout() {
        closeFullscreen();
        Uri about = Uri.parse(HOME + "about.html").buildUpon()
            .appendQueryParameter("installed", installedVersion()).build();
        web.loadUrl(about.toString());
    }
    private boolean handleAboutLink(Uri uri) {
        String path = uri.getPath();
        if (allowed(uri) && ("/tv-signage/about.html".equals(path)
                || "/tv-signage/public/about.html".equals(path))) {
            // Always use the installed package version instead of a link's query value.
            if (!installedVersion().equals(uri.getQueryParameter("installed"))) {
                openAbout(); return true;
            }
        }
        if (isReleaseLink(uri)) { openExternal(uri); return true; }
        return false;
    }
    private boolean isReleaseLink(Uri uri) {
        if (!"https".equals(uri.getScheme())) return false;
        String path = uri.getPath();
        if (path == null) return false;
        return ("github.com".equals(uri.getHost()) &&
                ("/KHAN7-gif/tv-signage/releases".equals(path)
                || path.startsWith("/KHAN7-gif/tv-signage/releases/")))
            || (allowed(uri) && path.startsWith("/tv-signage/public/downloads/") && path.endsWith(".apk"));
    }
    private void openExternal(Uri uri) {
        if (!isReleaseLink(uri)) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
        catch (ActivityNotFoundException error) {
            new AlertDialog.Builder(this).setTitle("Muat turun MDE Play")
                .setMessage("TV ini tiada browser untuk muat turun. Buka pautan ini pada telefon atau komputer dan pindahkan APK melalui USB:\n\n" + uri)
                .setPositiveButton("Tutup", (dialog, which) -> immersive()).show();
        }
    }
    private boolean allowed(Uri uri) {
        String path = uri.getPath();
        return "https".equals(uri.getScheme()) && "khan7-gif.github.io".equals(uri.getHost())
            && path != null && path.startsWith("/tv-signage/");
    }
    private boolean allowedFrame(Uri uri) {
        String host = uri.getHost();
        return "https".equals(uri.getScheme()) && ("www.youtube-nocookie.com".equals(host)
            || "www.youtube.com".equals(host) || allowed(uri));
    }
    private void openHome() {
        handler.removeCallbacks(retry);
        failed = false; offline.setVisibility(View.GONE); web.loadUrl(HOME);
    }
    private void showOffline() {
        failed = true; offline.setVisibility(View.VISIBLE);
        offline.getChildAt(1).requestFocus();
        handler.removeCallbacks(retry); handler.postDelayed(retry, 10000);
    }
    private void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }
    private void closeFullscreen() {
        if (fullscreenView != null) {
            frame.removeView(fullscreenView); fullscreenView = null;
            if (fullscreenCallback != null) fullscreenCallback.onCustomViewHidden();
            fullscreenCallback = null;
        }
        immersive();
    }
    @Override public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getKeyCode() == KeyEvent.KEYCODE_MENU && event.getAction() == KeyEvent.ACTION_UP) {
            new AlertDialog.Builder(this).setTitle("MDE Play")
                .setItems(new String[]{"Muat semula signage", "About / Update APK", "Station Controller / iPhone", "Tetapkan Station 01-12", "Tutup"}, (dialog, which) -> { if (which == 0) openHome(); else if (which == 1) openAbout(); else if (which == 2) openStationInfo(); else if (which == 3) chooseStationNumber(); })
                .show();
            return true;
        }
        return super.dispatchKeyEvent(event);
    }
    @Override public void onBackPressed() {
        if (fullscreenView != null) { closeFullscreen(); return; }
        if (web.canGoBack()) { web.goBack(); return; }
        new AlertDialog.Builder(this).setMessage("Keluar daripada MDE Play?")
            .setPositiveButton("Keluar", (dialog, which) -> finish())
            .setNegativeButton("Batal", (dialog, which) -> immersive()).show();
    }
    @Override public void onWindowFocusChanged(boolean focus) { super.onWindowFocusChanged(focus); if (focus) immersive(); }
    @Override protected void onPause() { super.onPause(); web.onPause(); }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); immersive(); }
    @Override protected void onDestroy() { handler.removeCallbacksAndMessages(null); closeFullscreen(); web.destroy(); super.onDestroy(); }
}
