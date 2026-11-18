package com.kovcareeragency.app;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

/**
 * KOV's native Android shell. Applies app-only mobile layout corrections and
 * makes the Android Back button follow website navigation history.
 */
public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (bridge != null) {
            bridge.addWebViewListener(new WebViewListener() {
                @Override
                public void onPageLoaded(WebView webView) {
                    String url = webView.getUrl();
                    if (url == null || !url.contains("kovcareeragency.org")) return;

                    String script = """
                        (function () {
                          if (window.__kovMobileCompatApplied) return;
                          window.__kovMobileCompatApplied = true;

                          var style = document.createElement('style');
                          style.id = 'kov-native-mobile-compat';
                          style.textContent = `
                            html, body { width: 100% !important; max-width: 100% !important; overflow-x: hidden !important; }
                            *, *::before, *::after { box-sizing: border-box; }
                            img, video, iframe, svg { max-width: 100%; }
                            input, select, textarea, button { max-width: 100%; }
                            @media (max-width: 700px) {
                              form:has(input[placeholder*="Search KOV directory" i]) {
                                display: grid !important;
                                grid-template-columns: minmax(0, 1fr) auto !important;
                                gap: 8px !important;
                                width: 100% !important;
                                max-width: 100% !important;
                              }
                              input[placeholder*="Search KOV directory" i] {
                                width: 100% !important;
                                min-width: 0 !important;
                                max-width: 100% !important;
                              }
                              form:has(input[placeholder*="Search KOV directory" i]) button {
                                min-width: 96px !important;
                                max-width: 100% !important;
                                white-space: nowrap !important;
                              }
                            }
                          `;
                          (document.head || document.documentElement).appendChild(style);

                          document.querySelectorAll('input[placeholder*="Search KOV directory" i]').forEach(function(input) {
                            var form = input.closest('form,[role="search"]');
                            if (form) {
                              form.style.setProperty('display', 'grid', 'important');
                              form.style.setProperty('grid-template-columns', 'minmax(0, 1fr) auto', 'important');
                              form.style.setProperty('gap', '8px', 'important');
                              form.style.setProperty('width', '100%', 'important');
                              form.style.setProperty('max-width', '100%', 'important');
                              input.style.setProperty('width', '100%', 'important');
                              input.style.setProperty('min-width', '0', 'important');
                              input.style.setProperty('max-width', '100%', 'important');
                            }
                          });

                          var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                          var node;
                          while ((node = walker.nextNode())) {
                            if (node.parentElement === document.body && /^"+$/.test(node.nodeValue.trim())) {
                              node.nodeValue = '';
                            }
                          }
                        })();
                        """;
                    webView.evaluateJavascript(script, null);
                }
            });
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null && webView.canGoBack()) {
                webView.goBack();
                return;
            }
        }
        super.onBackPressed();
    }
}
