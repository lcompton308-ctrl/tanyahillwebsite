package com.tanyahill.colourprofile

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.webkit.WebViewAssetLoader

class MainActivity : ComponentActivity() {
    private lateinit var web: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(Color.parseColor("#0a0a0a")),
            navigationBarStyle = SystemBarStyle.dark(Color.parseColor("#0a0a0a"))
        )
        super.onCreate(savedInstanceState)

        // Serves the quiz from inside the app (no internet needed).
        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web = WebView(this).apply {
            setBackgroundColor(Color.parseColor("#0a0a0a"))
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.textZoom = 100
            overScrollMode = WebView.OVER_SCROLL_NEVER
            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest) =
                    loader.shouldInterceptRequest(request.url)

                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    val url = request.url
                    if (url.host == "appassets.androidplatform.net") return false
                    // Phone number and any outside links open in the phone's own apps.
                    val intent = if (url.scheme == "tel") Intent(Intent.ACTION_DIAL, url)
                                 else Intent(Intent.ACTION_VIEW, url)
                    runCatching { startActivity(intent) }
                    return true
                }
            }
        }
        setContentView(web)

        if (savedInstanceState != null) web.restoreState(savedInstanceState)
        else web.loadUrl("https://appassets.androidplatform.net/assets/index.html")

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                web.evaluateJavascript("window.appBack && window.appBack()") { handled ->
                    if (handled != "true") finish()
                }
            }
        })
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }
}
