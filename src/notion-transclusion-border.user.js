// ==UserScript==
// @name         Notion Transclusion Border
// @version      0.0.1
// @description  Add a faint border to transclusion blocks in Notion
// @author       robert.mcgui@gmail.com
// @homepage     https://github.com/robatron/user-scripts/
//
// @downloadURL  https://raw.githubusercontent.com/robatron/user-scripts/refs/heads/main/src/notion-transclusion-border.user.js
// @updateURL    https://raw.githubusercontent.com/robatron/user-scripts/refs/heads/main/src/notion-transclusion-border.user.js
//
// @grant        none
// @icon         https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png
// @match        https://www.notion.so/*
// @sandbox      JavaScript
// ==/UserScript==

// How many timestamp replacements have been processed total
let processCount = 0;

// Logging
const consoleFn = (fn, ...args) => console[fn]('[NTB]', ...args);
const log = (...args) => consoleFn('log', ...args);
const info = (...args) => consoleFn('info', ...args);
const debug = (...args) => consoleFn('debug', ...args);

function main() {
    log('Starting Notion Transclusion Border (Tampermonkey)');
}

main();
