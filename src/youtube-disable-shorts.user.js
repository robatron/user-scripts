// ==UserScript==
// @name         Block YouTube Shorts Playback
// @version      0.0.4
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

    // Watch for document title changes (YouTube updates title on navigation)
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
        debug('Title change observer initialized');
    }
}

main();
