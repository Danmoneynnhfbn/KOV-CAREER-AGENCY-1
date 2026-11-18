package com.kovcareeragency.app;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

/**
 * KOV's native Android shell.
 *
 * Keeps normal website history navigable with Android Back and applies narrowly
 * scoped presentation fixes inside the app WebView only. The public website is
 * not modified by these compatibility rules.
 */
public class MainActivity extends BridgeActivity {
    private static final String KOV_HOST = "kovcareeragency.org";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (bridge != null) {
            bridge.addWebViewListener(new WebViewListener() {
                @Override
                public void onPageLoaded(WebView webView) {
                    String url = webView.getUrl();
                    if (url == null || !(url.contains("://" + KOV_HOST) || url.contains("://www." + KOV_HOST))) {
                        return;
                    }

                    String compatibilityScript =
                        "(function() {" +
                        " if (window.__kovMobileCompatApplied) return;" +
                        " window.__kovMobileCompatApplied = true;" +
                        " var style = document.getElementById('kov-native-mobile-compat');" +
                        " if (!style) {" +
                        "   style = document.createElement('style');" +
                        "   style.id = 'kov-native-mobile-compat';" +
                        "   style.textContent = '" +
                        "     html,body{max-width:100%!important;overflow-x:hidden!important;}" +
                        "     *,*:before,*:after{box-sizing:border-box;}" +
                        "     img,video,iframe,svg{max-width:100%;}" +
                        "     form,[role=search]{max-width:100%;}" +
                        "     form:has(input[placeholder*=\\\"Search KOV directory\\\" i]){display:flex!important;flex-wrap:wrap!important;width:100%!important;max-width:100%!important;}" +
                        "     form:has(input[placeholder*=\\\"Search KOV directory\\\" i]) button{flex:0 1 auto!important;max-width:100%!important;}" +
                        "     input,select,textarea,button{max-width:100%;}" +
                        "     @media(max-width:600px){" +
                        "       input[placeholder*=\\\"Search KOV directory\\\" i]{min-width:0!important;max-width:100%!important;}" +
                        "       input[placeholder*=\\\"Search KOV directory\\\" i]{flex:1 1 180px!important;}" +
                        "       input[placeholder*=\\\"Search KOV directory\\\" i]{width:auto!important;}" +
                        "     }" +
                        "   ';" +
                        "   document.head.appendChild(style);" +
                        " }" +
                        
                        " var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),node;" +
                        " while((node=walker.nextNode())){" +
                        "   if(node.parentElement===document.body && node.nodeValue.trim()==='\\\"'){node.nodeValue='';}" +
                        " }" +
                        "})();";
                    webView.evaluateJavascript(compatibilityScript, null);
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
