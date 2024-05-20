// ==UserScript==
// @name         Slack Absolute Timestamps
// @version      0.0.2
// @description  Replace messages' relative timestamps with absolute ones
// @author       robert.mcgui@gmail.com
// @homepage     https://github.com/robatron/strava-quick-manual-entry
//
// @downloadURL  https://gist.githubusercontent.com/robatron/0e4fcda19f77b1b6471ea72cda96ca89/raw/slack-message-tweaks.user.js
// @updateURL    https://gist.githubusercontent.com/robatron/0e4fcda19f77b1b6471ea72cda96ca89/raw/slack-message-tweaks.user.js
//
// @grant        none
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @match        https://app.slack.com/*
// @sandbox      JavaScript
// ==/UserScript==
let processCount = 0;

// Logging
const consoleFn = (fn, ...args) => console[fn]('[SAT]', ...args);
const log = (...args) => consoleFn('log', ...args);
const info = (...args) => consoleFn('info', ...args);
const debug = (...args) => consoleFn('debug', ...args);

function debounce(func, timeout = 1000) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), timeout);
    };
}

function replaceAbsTimestamp(timestampEl) {
    const epochTimestamp = timestampEl.getAttribute('data-ts') * 1000;
    const date = new Date(epochTimestamp);
    const dateString = date.toDateString();
    const timeString = date.toTimeString().split(' ')[0];
    const absTimestamp = [dateString, timeString].join(' ');
    const timestampLabelEl =
        timestampEl.getElementsByClassName('c-timestamp__label')[0];
    const timestampLabelText = timestampLabelEl.innerHTML;
    const isTimestamped = timestampLabelText.includes(absTimestamp);

    if (!isTimestamped) {
        info(`Adding ${absTimestamp}`);
        debug('timestampEl:', timestampEl);
        timestampLabelEl.innerHTML = absTimestamp;
    }
}

function processTimestampEls() {
    const timestamps = [...document.getElementsByClassName('c-timestamp')];
    const tsCount = timestamps.length;

    log(`Processing ${tsCount} timestamps (#${processCount})`);

    for (let i = 0; i < tsCount; ++i) {
        const timestamp = timestamps[i];
        replaceAbsTimestamp(timestamp);
    }

    processCount++;
}

function main() {
    log('Starting Slack Message Tweaks (Tampermonkey)');

    processTimestampEls();

    const body = document.getElementsByTagName('body')[0];

    body.addEventListener('mouseenter', debounce(processTimestampEls));
}

main();
