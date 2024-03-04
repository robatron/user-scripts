// ==UserScript==
// @name         Slack Browser Redirect
// @version      0.0.1
// @description  Always open Slack message links in browser (never the app)
// @author       robert.mcgui@gmail.com
// @match        https://zillowgroup.slack.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
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
