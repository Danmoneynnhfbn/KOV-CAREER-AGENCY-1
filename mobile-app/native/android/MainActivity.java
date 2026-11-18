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
                            html, body { max-width: 100% !important; overflow-x: hidden !important; }
                            *, *::before, *::after { box-sizing: border-box; }
                            img, video, iframe, svg { max-width: 100%; }
                            form, [role="search"] { max-width: 100%; }
                            input, select, textarea, button { max-width: 100%; }
                          `;
                          (document.head || document.documentElement).appendChild(style);

                          document.querySelectorAll('input[placeholder*="Search KOV directory" i]').forEach(function(input) {
                            input.style.minWidth = '0';
                            input.style.maxWidth = '100%';
                            input.style.flex = '1 1 180px';
                            var parent = input.parentElement;
                            for (var depth = 0; parent && depth < 3; depth++, parent = parent.parentElement) {
                              parent.style.maxWidth = '100%';
                              parent.style.boxSizing = 'border-box';
                              if (parent.tagName === 'FORM' || parent.getAttribute('role') === 'search') {
                                parent.style.width = '100%';
                                parent.style.display = 'flex';
                                parent.style.flexWrap = 'wrap';
                                break;
                              }
                            }
                          });

                          var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                          var node;
                          while ((node = walker.nextNode())) {
                            if (node.parentElement === document.body && node.nodeValue.trim() === '"') {
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
