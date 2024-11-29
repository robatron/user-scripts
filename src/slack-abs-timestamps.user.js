// ==UserScript==
// @name         Slack Absolute Timestamps
// @version      0.3.2
// @description  Replace messages' relative timestamps with absolute ones
// @author       robert.mcgui@gmail.com
// @homepage     https://github.com/robatron/user-scripts/
//
// @downloadURL  https://raw.githubusercontent.com/robatron/user-scripts/refs/heads/main/src/slack-abs-timestamps.user.js
// @updateURL    https://raw.githubusercontent.com/robatron/user-scripts/refs/heads/main/src/slack-abs-timestamps.user.js
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

const CONTENT_LABEL_FORMAT_RULES = [
    [/^Conversation with/, '👥'],
    [/^Thread in channel (.*)/, '🧵 #$1'],
    [/^Channel (.*) \(private\)/, '#$1 (\u{1F510})'],
    [/^Channel (.*)/, '#$1'],
];

function formatContentLabel(label) {
    for (const [pattern, replacement] of CONTENT_LABEL_FORMAT_RULES) {
        label = label.replace(pattern, replacement);
    }
    return label;
}

/**
 * Converts an epoch timestamp to an absolute timestamp. Returns an
 * array containing the date and time strings, e.g.,
 *
 * ```js
 * ['Mon Nov 25 2024',  '20:59:53']
 * ```
 */
function getAbsTimestamp(epochTimestamp) {
    const date = new Date(epochTimestamp * 1000);
    const dateString = date.toDateString();
    const timeString = date.toTimeString().split(' ')[0];
    return [dateString, timeString];
}

/**
 * Replaces a relative timestamp with an absolute timestamp and appends the
 * content label (e.g., the channel name) if defined. E.g.,
 *
 *     Thu Nov 28 2024 20:59:53 (Conversation with Alice Bobbington)
 */
function replaceAbsTimestamp(timestampEl, contentLabel, ancestorNode) {
    const epochTimestamp = timestampEl.getAttribute('data-ts');
    const [dateString, timeString] = getAbsTimestamp(epochTimestamp);
    const timestampText = [dateString, timeString, contentLabel].join(' ');

    const timestampLabelEl =
        timestampEl.getElementsByClassName('c-timestamp__label')[0];
    const curTimestampText = timestampLabelEl.innerHTML;
    const isAlreadyTimestamped = curTimestampText.includes(timestampText);

    debug(
        'Processing timestamp elements:',
        '\n‣ timestampEl:',
        timestampEl,
        '\n‣ ancestorNode:',
        ancestorNode,
    );

    // Bail if timestamp has already been replaced
    if (isAlreadyTimestamped) {
        info(`Already timestamped "${curTimestampText}". Skipping...`);
        return;
    }

    info(`Adding #${processCount} "${timestampText}"`);

    timestampLabelEl.innerHTML = timestampText;
    processCount++;
}

/**
 * Finds timestamp nodes added to the page from a MutationObserver and passes
 * them and the content label (e.g., the channel name) to the timestamp
 * replacement function.
 */
function processAddedTimestampNodes(observerMutation) {
    // Bail if observer notation is *not* an added node
    if (!observerMutation.addedNodes.length) return;

    const contentLabel = document.querySelectorAll(
        '.p-view_contents--primary',
    )[0].ariaLabel;
    const formattedContentLabel = '— ' + formatContentLabel(contentLabel);

    observerMutation.addedNodes.forEach((addedNode) => {
        // Bail if node is not a parent element
        if (!addedNode?.querySelectorAll) return;

        requestIdleCallback(() => {
            // Process any timestamp elements
            addedNode
                .querySelectorAll('.c-message_kit__gutter__right .c-timestamp')
                .forEach((timestampEl) => {
                    replaceAbsTimestamp(
                        timestampEl,
                        formattedContentLabel,
                        addedNode,
                    );
                });
        });
    });
}

function main() {
    log('Starting Slack Absolute Timestamps (Tampermonkey)');

    const observer = new MutationObserver((mutations) =>
        mutations.forEach(processAddedTimestampNodes),
    );

    observer.observe(document.body, { childList: true, subtree: true });
}

main();
