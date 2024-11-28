// ==UserScript==
// @name         Slack Absolute Timestamps
// @version      0.2.0
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

function processTimestampEl(timestampEl) {
    const channelTitleEl = document.querySelectorAll(
        '.p-view_header__channel_title, .c-channel_entity__name',
    )[0];
    const channelTitle = channelTitleEl?.textContent;
    const formattedChannelTitle = channelTitle && `(#${channelTitle})`;

    log(`Processing timestamp #${processCount}`);
    debug('Using channel name', formattedChannelTitle);

    replaceAbsTimestamp(timestampEl, formattedChannelTitle);

    processCount++;
}

function main() {
    log('Starting Slack Absolute Timestamps (Tampermonkey)');

    const TIMESTAMP_SELCTOR = '.c-message_kit__gutter__right .c-timestamp';
    const CHANNEL_TITLE_SELECTOR =
        '.p-view_header__channel_title, .c-channel_entity__name';

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach((node) => {
                    const timestampEls =
                        node?.querySelectorAll(TIMESTAMP_SELCTOR) || [];

                    timestampEls.forEach((timestampEl) => {
                        processTimestampEl(timestampEl);
                    });
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

main();
