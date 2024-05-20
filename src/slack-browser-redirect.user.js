// ==UserScript==
// @name         Slack Browser Redirect
// @version      0.0.3
// @description  Always open Slack message links in browser (never the app)
// @author       robert.mcgui@gmail.com
// @homepage     https://github.com/robatron/strava-quick-manual-entry
//
// @downloadURL  https://github.com/robatron/user-scripts/raw/main/src/slack-browser-redirect.user.js
// @updateURL    https://github.com/robatron/user-scripts/raw/main/src/slack-browser-redirect.user.js
//
// @grant        none
// @icon         https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png
// @match        https://zillowgroup.enterprise.slack.com/*
// @match        https://zillowgroup.slack.com/*
// @sandbox      JavaScript
// ==/UserScript==

const consoleFn = (fn, ...args) => console[fn]('[SBR]', ...args);
const log = (...args) => consoleFn('log', ...args);
const info = (...args) => consoleFn('info', ...args);
const debug = (...args) => consoleFn('debug', ...args);

function main() {
    log('Starting Slack Browser Redirect (Tampermonkey)');

    const isDryRun = document.location.hash.includes('dryrun');

    const redirectLoadingMessageLinks = document.querySelectorAll(
        '.p-ssb_redirect__loading_messages a',
    );
    const openInBrowserLink = [...redirectLoadingMessageLinks].find((el) =>
        el.href.includes('/messages/'),
    );

    if (openInBrowserLink) {
        log('Found open-in-browser link:', openInBrowserLink);

        if (isDryRun) {
            log('Dry run 🌵 - Skipping');
            return;
        }

        log('Simulating click to redirect to', openInBrowserLink.href);
        setTimeout(() => openInBrowserLink.click(), 1000);
    } else {
        log('No open-in-browser link found 🫤 - Skipping');
    }
}

main();
