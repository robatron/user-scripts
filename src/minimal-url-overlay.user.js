// ==UserScript==
// @name         Minimal Full URL Overlay
// @version      0.0.4
// @description  Always show the full current URL in a tiny overlay for screenshots
// @author       robert.mcgui@gmail.com
// @homepage     https://github.com/robatron/user-scripts/
// @downloadURL  https://github.com/robatron/user-scripts/raw/main/src/minimal-url-overlay.user.js
// @updateURL    https://github.com/robatron/user-scripts/raw/main/src/minimal-url-overlay.user.js
// @grant        none
// @icon         https://www.mozilla.org/media/protocol/img/logos/firefox/browser/logo.f6eb1d086f92.svg
// @match        *://*/*
// @include      file:///*
// @noframes
// ==/UserScript==

(() => {
    // Guard: only run in the top window (no iframes)
    if (window.top !== window.self) return;

    // ============================================================================
    // Config
    // ============================================================================
    const ID = 'minimal-url-overlay';
    const POSITION = { right: '6px', bottom: '6px' };
    const FONT = '10px/1.3 ui-monospace, monospace';
    const BG_COLOR = 'rgba(0,0,0,0.65)';
    const TEXT_COLOR = '#fff';
    const PADDING = '3px 6px';
    const BORDER_RADIUS = '4px';
    const MAX_WIDTH = '95vw';
    const UPDATE_INTERVAL_MS = 800; // Polling interval for URL changes

    // ============================================================================
    // Logging
    // ============================================================================
    const consoleFn = (fn, ...args) => console[fn]('[URL Overlay]', ...args);
    const log = (...args) => consoleFn('log', ...args);
    const info = (...args) => consoleFn('info', ...args);
    const debug = (...args) => consoleFn('debug', ...args);

    // ============================================================================
    // Styles
    // ============================================================================
    const css = `
    #${ID} {
      position: fixed;
      right: ${POSITION.right};
      bottom: ${POSITION.bottom};
      z-index: 2147483647;
      font: ${FONT};
      background: ${BG_COLOR};
      color: ${TEXT_COLOR};
      padding: ${PADDING};
      border-radius: ${BORDER_RADIUS};
      max-width: ${MAX_WIDTH};
      word-break: break-all;
      pointer-events: none;
      user-select: text;
    }
    @media print {
      #${ID} { display: none; }
    }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.documentElement.appendChild(style);
    debug('Injected CSS for overlay');

    // ============================================================================
    // Overlay Helpers
    // ============================================================================
    function ensureOverlay() {
        let el = document.getElementById(ID);
        if (!el) {
            el = document.createElement('div');
            el.id = ID;
            document.documentElement.appendChild(el);
            info('Overlay created');
        }
        return el;
    }

    function update() {
        const el = ensureOverlay();
        const newURL = location.href;
        if (el.textContent !== newURL) {
            debug('URL updated:', newURL);
            el.textContent = newURL;
        }
    }

    // ============================================================================
    // Hook navigation events
    // ============================================================================
    ['pushState', 'replaceState'].forEach((fn) => {
        const orig = history[fn];
        history[fn] = function () {
            const ret = orig.apply(this, arguments);
            debug(`history.${fn} called`);
            update();
            return ret;
        };
    });

    window.addEventListener(
        'popstate',
        () => {
            debug('popstate event');
            update();
        },
        true,
    );

    window.addEventListener(
        'hashchange',
        () => {
            debug('hashchange event');
            update();
        },
        true,
    );

    // Poll for changes (covers SPAs that don’t trigger events)
    let last = '';
    setInterval(() => {
        if (location.href !== last) {
            last = location.href;
            debug('URL changed via polling:', last);
            update();
        }
    }, UPDATE_INTERVAL_MS);

    // ============================================================================
    // Init
    // ============================================================================
    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            () => {
                log('DOMContentLoaded: initializing overlay');
                update();
            },
            { once: true },
        );
    } else {
        log('Document already loaded: initializing overlay');
        update();
    }
})();
