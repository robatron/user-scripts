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
// @icon         https://www.notion.so/images/favicon.ico
// @match        https://www.notion.so/*
// @sandbox      JavaScript
// ==/UserScript==

// Logging
const consoleFn = (fn, ...args) => console[fn]('[NTB]', ...args);
const log = (...args) => consoleFn('log', ...args);
const info = (...args) => consoleFn('info', ...args);
const debug = (...args) => consoleFn('debug', ...args);

// The border should surround the transclusion block, have rounded corners, and be faint. Since we want it to work with both light and dark mode, we'll use transparency.
const BORDER_STYLE = '1px dashed rgba(0, 255, 0, 0.15)';
const BORDER_RADIUS = '5px';
const BORDER_CSS = [
    ['border', BORDER_STYLE].join(':'),
    ['border-radius', BORDER_RADIUS].join(':'),
].join(';');
const TRANSCLUSION_BLOCK_SELECTOR = '.notion-transclusion_reference-block';

function main() {
    log('Starting Notion Transclusion Border (Tampermonkey)');

    // Since the transclusion blocks are added to the DOM after the page has loaded,
    // we'll style them with vanilla CSS.
    const style = document.createElement('style');
    style.id = 'notion-transclusion-border-user-script';
    style.textContent = `${TRANSCLUSION_BLOCK_SELECTOR} { ${BORDER_CSS} }`;
    document.head.appendChild(style);

    debug('Injected CSS for transclusion blocks with user script ID', style.id);
}

main();
