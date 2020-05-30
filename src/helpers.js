'use strict';

export function log(message) {
    document.getElementById('log').innerHTML += '<li>' + message + '</li>'
};

export function showCookieSettings(cyn) {
    const settings = JSON.stringify(cyn.getSettings(), null, 2);
    document.getElementById('settings').innerHTML = settings;
};

export function clearCookie(cname) {
    document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;SameSite=Lax';
};
