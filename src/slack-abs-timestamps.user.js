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

// How many timestamp replacements have been processed total
let processCount = 0;

// Logging
const consoleFn = (fn, ...args) => console[fn]('[SAT]', ...args);
const log = (...args) => consoleFn('log', ...args);
const info = (...args) => consoleFn('info', ...args);
const debug = (...args) => consoleFn('debug', ...args);

/**
 * Replace timestamp label with absolute timestamp with the content label suffix
 * (e.g., the channel name) if defined.
 */
function replaceAbsTimestamp(timestampEl, contentLabel) {
    const epochTimestamp = timestampEl.getAttribute('data-ts') * 1000;
    const date = new Date(epochTimestamp);
    const dateString = date.toDateString();
    const timeString = date.toTimeString().split(' ')[0];
    const absTimestamp = [dateString, timeString, contentLabel].join(' ');
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
    const contentLabel = document.querySelectorAll(
        '.p-view_contents--primary',
    )[0].ariaLabel;
    const formattedContentLabel = contentLabel && `(${contentLabel})`;

    log(
        `Processing timestamp #${processCount} with content label:`,
        formattedContentLabel,
    );

    replaceAbsTimestamp(timestampEl, formattedContentLabel);

    processCount++;
}

function processAddedTimestampNodes(observerMutation) {
    // Bail if observer notation is *not* an added node
    if (!observerMutation.addedNodes) return;

    observerMutation.addedNodes.forEach((node) => {
        // Bail if node is not a searchable element for some reason
        if (!node?.querySelectorAll) return;

        // Process any timestamp elements
        node.querySelectorAll(
            '.c-message_kit__gutter__right .c-timestamp',
        ).forEach((timestampEl) => processTimestampEl(timestampEl));
    });
}

function main() {
    log('Starting Slack Absolute Timestamps (Tampermonkey)');

    // const CHANNEL_TITLE_SELECTOR =
    //     '.p-view_header__channel_title, .c-channel_entity__name';

    const observer = new MutationObserver((mutations) =>
        mutations.forEach(processAddedTimestampNodes),
    );

    observer.observe(document.body, { childList: true, subtree: true });
}

main();
