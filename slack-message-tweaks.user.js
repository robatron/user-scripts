// ==UserScript==
// @name         Slack Message Tweaks
// @version      0.1.0
// @description  Add absolute timestamps to messages, and swap app links for web links
// @author       robert.mcgui@gmail.com
// @match        https://app.slack.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @sandbox      JavaScript
// @downloadURL  https://gist.githubusercontent.com/robatron/0e4fcda19f77b1b6471ea72cda96ca89/raw/slack-message-tweaks.user.js
// @updateURL    https://gist.githubusercontent.com/robatron/0e4fcda19f77b1b6471ea72cda96ca89/raw/slack-message-tweaks.user.js
// ==/UserScript==
let processCount = 0;

// Logging
const consoleFn = (fn, ...args) => console[fn]('[⏱️SMT]', ...args);
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

function addAbsDateTime(timestampEl) {
    const epochTimestamp = timestampEl.getAttribute('data-ts') * 1000;
    const date = new Date(epochTimestamp);
    const dateString = date.toDateString();
    const timeString = date.toTimeString().split(' ')[0];
    const dateTimeString = [dateString, timeString].join(' ');
    const timestampLabelEl =
        timestampEl.getElementsByClassName('c-timestamp__label')[0];
    const timestampLabelText = timestampLabelEl.innerHTML;
    const isTimestamped = timestampLabelText.includes(dateTimeString);

    if (!isTimestamped) {
        info(`Adding ${dateTimeString}`);
        debug(
            'timestampEl:',
            timestampEl,
            ', epochTimestamp:',
            epochTimestamp,
            ', dateTimeString:',
            dateTimeString
        );
        timestampLabelEl.innerHTML = `${timestampLabelText} (${dateTimeString})`;
    }
}

function updateLinkURL(timestampLink) {
    const origLinkURL = timestampLink.getAttribute('href');
    const messagePath = origLinkURL.split('archives/')[1];
    const newLinkURL = `/messages/${messagePath}`;
    const isLinkUpdated = origLinkURL.includes('messages');

    if (!isLinkUpdated) {
        info(`Updating link ${newLinkURL}`);
        debug(
            'origLinkURL:',
            origLinkURL,
            ', messagePath:',
            messagePath,
            ', newLinkURL:',
            newLinkURL
        );
        timestampLink.setAttribute('href', newLinkURL);
    }
}

function processTimestampEls() {
    const timestamps = [...document.getElementsByClassName('c-timestamp')];
    const tsCount = timestamps.length;

    log(`Processing ${tsCount} timestamps (#${processCount})`);

    for (let i = 0; i < tsCount; ++i) {
        const timestamp = timestamps[i];
        addAbsDateTime(timestamp);
        updateLinkURL(timestamp);
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
