// ==UserScript==
// @name         Block YouTube Shorts Playback
// @version      0.0.7
// @description  Disables and strips Shorts from YouTube
// @author       robert.mcgui@gmail.com
// @homepage     https://github.com/robatron/user-scripts/
// @downloadURL  https://github.com/robatron/user-scripts/raw/main/src/youtube-disable-shorts.user.js
// @updateURL    https://github.com/robatron/user-scripts/raw/main/src/youtube-disable-shorts.user.js
// @grant        none
// @icon         https://www.youtube.com/favicon.ico
// @match        https://www.youtube.com/*
// ==/UserScript==

// Constants
const SHORTS_PATH = '/shorts/';
const HOME_URL = 'https://www.youtube.com';

// Logging
const consoleFn = (fn, ...args) => console[fn]('[YT]', ...args);
const log = (...args) => consoleFn('log', ...args);
const info = (...args) => consoleFn('info', ...args);
const debug = (...args) => consoleFn('debug', ...args);

/**
 * Check if the current page is a shorts page and redirect to the home page if it is.
 */
function checkAndRedirectShorts() {
    if (window.location.pathname.includes(SHORTS_PATH)) {
        info('Detected shorts page, redirecting to home');
        window.location.replace(HOME_URL);
    }
}

function main() {
    log('Starting YouTube Disable Shorts (Tampermonkey)');

    // First check to see if we've directly navigated to a shorts page
    checkAndRedirectShorts();

    let currentTitle = document.title;
    let currentUrl = window.location.href;

    // Watch for <title/> changes to detect soft navigations
    const titleObserver = new MutationObserver(() => {
        const newTitle = document.title;
        const newUrl = window.location.href;

        if (newUrl !== currentUrl) {
            debug('Soft nav detected via <title/> change:');
            debug(
                '- title:\n',
                `    "${currentTitle}" →\n`,
                `    "${newTitle}"`,
            );
            debug('- url:\n', `    "${currentUrl}" →\n`, `    "${newUrl}"\n`);

            currentTitle = newTitle;
            currentUrl = newUrl;

            checkAndRedirectShorts();
        }
    });

    const titleElement = document.querySelector('title');

    if (titleElement) {
        titleObserver.observe(titleElement, { childList: true });
        debug('<title/> change observer initialized');
    }
}

main();
