// ==UserScript==
// @name         Block YouTube Shorts Playback
// @version      0.0.2
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

    // First, check if we've directly navigated to a shorts page
    if (window.location.pathname.includes('/shorts/')) {
        info('Directly navigated to a shorts page');
        window.location.replace('https://www.youtube.com');
        return;
    }

    // Next, watch for changes to location.pathname
    window.addEventListener('popstate', (event) => {
        info('Soft navigation to a shorts page. Event:', event);
        if (event.state?.pathname.includes('/shorts/')) {
            window.location.replace('https://www.youtube.com');
        }
    });
}

main();
