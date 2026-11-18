import UIKit
import WebKit
import Capacitor

/// App-only mobile presentation compatibility. The KOV production website is untouched.
class ViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()

        let source = """
        (function () {
          if (window.__kovMobileCompatApplied) return;
          window.__kovMobileCompatApplied = true;

          const style = document.createElement('style');
          style.id = 'kov-native-mobile-compat';
          style.textContent = `
            html, body { max-width: 100% !important; overflow-x: hidden !important; }
            *, *::before, *::after { box-sizing: border-box; }
            img, video, iframe, svg { max-width: 100%; }
            form, [role="search"] { max-width: 100%; }
            input, select, textarea, button { max-width: 100%; }
          `;
          (document.head || document.documentElement).appendChild(style);

          const search = document.querySelectorAll('input[placeholder*="Search KOV directory" i]');
          search.forEach((input) => {
            input.style.minWidth = '0';
            input.style.maxWidth = '100%';
            input.style.flex = '1 1 180px';
            let parent = input.parentElement;
            for (let depth = 0; parent && depth < 3; depth++, parent = parent.parentElement) {
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

          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            if (node.parentElement === document.body && node.nodeValue.trim() === '"') {
              node.nodeValue = '';
            }
          }
        })();
        """

        let userScript = WKUserScript(
            source: source,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: true
        )
        webView?.configuration.userContentController.addUserScript(userScript)
    }
}
