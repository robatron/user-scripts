// ==UserScript==
// @name         Block YouTube Shorts Playback
// @version      0.0.3
// @description  Disables and strips Shorts from YouTube
// @author       robert.mcgui@gmail.com
// @homepage     https://github.com/robatron/user-scripts/
// @downloadURL  https://github.com/robatron/user-scripts/raw/main/src/youtube-disable-shorts.user.js
// @updateURL    https://github.com/robatron/user-scripts/raw/main/src/youtube-disable-shorts.user.js
// @grant        none
// @icon         https://www.youtube.com/favicon.ico
// @match        https://www.youtube.com/*
// ==/UserScript==

// Logging
const consoleFn = (fn, ...args) => console[fn]('[YT]', ...args);
const log = (...args) => consoleFn('log', ...args);
const info = (...args) => consoleFn('info', ...args);
const debug = (...args) => consoleFn('debug', ...args);

function main() {
    log('Starting YouTube Disable Shorts (Tampermonkey)');

    function checkAndRedirectShorts() {
        if (window.location.pathname.includes('/shorts/')) {
            info('Detected shorts page, redirecting to home');
            window.location.replace('https://www.youtube.com');
            return true;
        }
        return false;
    }

    // First, check if we've directly navigated to a shorts page
    if (checkAndRedirectShorts()) {
        return;
    }

    // Track current URL for change detection
    let currentUrl = window.location.href;

    // Method 1: Override both history and window.history methods
    function overrideHistoryMethod(obj, method) {
        const original = obj[method];
        obj[method] = function (...args) {
            debug(`${method} called with args:`, args);
            const result = original.apply(this, args);
            setTimeout(checkAndRedirectShorts, 0);
            return result;
        };
    }

    // Try overriding on both objects
    if (typeof history !== 'undefined') {
        overrideHistoryMethod(history, 'pushState');
        overrideHistoryMethod(history, 'replaceState');
        debug('Overrode history methods');
    }
    if (typeof window.history !== 'undefined') {
        overrideHistoryMethod(window.history, 'pushState');
        overrideHistoryMethod(window.history, 'replaceState');
        debug('Overrode window.history methods');
    }

    // Method 2: Watch for document title changes (YouTube updates title on navigation)
    const titleObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (
                mutation.type === 'childList' &&
                mutation.target.nodeName === 'TITLE'
            ) {
                const newUrl = window.location.href;
                if (newUrl !== currentUrl) {
                    debug(
                        'URL change detected via title change:',
                        currentUrl,
                        '->',
                        newUrl,
                    );
                    currentUrl = newUrl;
                    checkAndRedirectShorts();
                }
            }
        });
    });

    // Observe title element changes
    const titleElement = document.querySelector('title');
    if (titleElement) {
        titleObserver.observe(titleElement, { childList: true, subtree: true });
        debug('Watching title element for changes');
    }

    // Method 3: Listen for hashchange events (just in case)
    window.addEventListener('hashchange', () => {
        debug('Hash change detected');
        setTimeout(checkAndRedirectShorts, 0);
    });

    // Method 4: Listen for popstate events
    window.addEventListener('popstate', (event) => {
        debug('Popstate event detected');
        setTimeout(checkAndRedirectShorts, 0);
    });

    debug('All navigation detection methods initialized');
}

main();
