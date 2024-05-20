// ==UserScript==
// @name         Strava Quick Manual Entry
// @version      0.1.2
// @description  Adds an input box to the manual entry page allowing for quick entry of an activity
// @author       robert.mcgui@gmail.com
// @homepage     https://github.com/robatron/strava-quick-manual-entry
//
// @downloadURL  https://gist.githubusercontent.com/robatron/5590620a5346715062301ebc0af0ed65/raw/sqme.user.js
// @updateURL    https://gist.githubusercontent.com/robatron/5590620a5346715062301ebc0af0ed65/raw/sqme.user.js
//
// @grant        none
// @icon         https://d3nn82uaxijpm6.cloudfront.net/favicon-32x32.png
// @match        https://www.strava.com/upload/manual
// @sandbox      JavaScript
// ==/UserScript==
const SCRIPT_NAME = 'Strava Quick Manual Entry';
const SCRIPT_NAME_SHORT = 'SQME';
const DEFAULT_ACTIVITY = 'Walk';

// Logging
const consoleFn = (fn, ...args) =>
    console[fn](`[🏃${SCRIPT_NAME_SHORT}]`, ...args);
const log = (...args) => consoleFn('log', ...args);
const debug = (...args) => consoleFn('debug', ...args);
const err = (...args) => consoleFn('error', ...args);

function insertInputBox() {
    const doc = document;
    const select = doc.querySelector.bind(doc);
    const createEl = doc.createElement.bind(doc);

    const parent = select('.manual-entry');
    const wrapper = createEl('div');
    const legend = createEl('legend');
    const inputBox = createEl('input');
    const hrElement = createEl('hr');

    legend.textContent = 'Quick entry';
    inputBox.setAttribute('placeholder', '12.34 5:43');

    wrapper.appendChild(legend);
    wrapper.appendChild(inputBox);
    wrapper.appendChild(hrElement);

    parent.insertBefore(wrapper, parent.firstChild);

    return inputBox;
}

function parseDistance(str) {
    const distMatch = str.match(/\d+\.\d+\b/);

    if (!distMatch) return;

    return parseFloat(distMatch[0]);
}

function parseTime(str) {
    const timeMatch = str.match(/\d+:\d\d\b/);

    if (!timeMatch) return;

    const time = timeMatch[0].split(':');
    const hours = parseInt(time[0]);
    const mins = parseInt(time[1]);

    return { hours, mins };
}

function setDistance(distance) {
    log('Set distance:', distance);

    const distEl = document.getElementById('activity_distance');
    distEl.value = distance;
}

function setHours(hours) {
    log('Set hours:', hours);

    const hoursEl = document.getElementById('activity_elapsed_time_hours');
    hoursEl.value = hours;
}

function setMins(mins) {
    log('Set mins:', mins);

    const minsEl = document.getElementById('activity_elapsed_time_minutes');
    minsEl.value = mins;
}

function setActivity(activity) {
    log('Set activity:', activity);

    const dropdown = document.getElementById('activity-type-dd');
    const input = dropdown.querySelector('#activity_sport_type');
    const display = dropdown.querySelector('.selection');

    input.value = activity;
    display.textContent = activity;
}

function setTitle(activity) {
    const titleEl = document.getElementById('activity_name');
    const curTitle = titleEl.value;
    const timeOfDay = curTitle.split(' ')[0];
    const newTitle = `${timeOfDay} ${activity}`;

    titleEl.value = newTitle;

    log(`Update title: "${curTitle}" → "${newTitle}"`);
}

function focusTitle() {
    const titleEl = document.getElementById('activity_name');
    log(`Focus title:`, titleEl);

    titleEl.focus();
}

function handleQuickEntryInput(inputVal) {
    log(`Handle quick entry input value: ${inputVal}`);

    const parsedDist = parseDistance(inputVal);
    const parsedTime = parseTime(inputVal);

    log(`\tParsed distance:`, parsedDist);
    log(`\tParsed time:`, parsedTime);

    if ([parsedDist, parsedTime].includes(undefined)) {
        throw new Error('Failed to parse distace and/or time. Try again.');
    }

    const { hours, mins } = parsedTime;

    setDistance(parsedDist);
    setHours(hours);
    setMins(mins);
}

// Main entrypoint
(function main() {
    log(`Start ${SCRIPT_NAME} (Tampermonkey)`);

    const inputBox = insertInputBox();

    inputBox.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            try {
                handleQuickEntryInput(inputBox.value);
            } catch (e) {
                err(e);
                return;
            }

            setActivity(DEFAULT_ACTIVITY);
            setTitle(DEFAULT_ACTIVITY);
            focusTitle();
        }
    });

    inputBox.focus();
})();
