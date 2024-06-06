// ==UserScript==
// @name         Slack Absolute Timestamps
// @version      0.1.0
// @description  Replace messages' relative timestamps with absolute ones
// @author       robert.mcgui@gmail.com
// @homepage     https://github.com/robatron/user-scripts/
//
// @downloadURL  https://github.com/robatron/user-scripts/raw/main/src/slack-abs-timestamps.user.js
// @updateURL    https://github.com/robatron/user-scripts/raw/main/src/slack-abs-timestamps.user.js
//
// @grant        none
// @icon         https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png
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

function replaceAbsTimestamp(timestampEl, channelTitle) {
    const epochTimestamp = timestampEl.getAttribute('data-ts') * 1000;
    const date = new Date(epochTimestamp);
    const dateString = date.toDateString();
    const timeString = date.toTimeString().split(' ')[0];
    const absTimestamp = [dateString, timeString, channelTitle].join(' ');
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
    const timestamps = [
        ...document.querySelectorAll(
            // Narrowing the selector to only include the topmost timestamp with
            // `.c-message_kit__gutter__right` class
            '.c-message_kit__gutter__right .c-timestamp',
        ),
    ];
    const tsCount = timestamps.length;
    const channelTitleEl = document.querySelectorAll(
        '.p-view_header__channel_title, .c-channel_entity__name',
    )[0];
    const channelTitle = channelTitleEl?.textContent;
    const formattedChannelTitle = channelTitle && `(#${channelTitle})`;

    log(`Processing ${tsCount} timestamps (#${processCount})`);
    debug('Using channel name', formattedChannelTitle);

    for (let i = 0; i < tsCount; ++i) {
        const timestamp = timestamps[i];
        replaceAbsTimestamp(timestamp, formattedChannelTitle);
    }

    processCount++;
}

function main() {
    log('Starting Slack Absolute Timestamps (Tampermonkey)');

    processTimestampEls();

    const body = document.getElementsByTagName('body')[0];

    body.addEventListener('mouseenter', debounce(processTimestampEls));
}

main();
