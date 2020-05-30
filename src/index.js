'use strict';

import CookieYesNo from './cookieyesno.js';
import { log, showCookieSettings, clearCookie } from './helpers.js';


const cyn = new CookieYesNo({
	text: 'This website uses cookies. You can select below which cookies will be stored on your device.',
    cookiePolicy: '#',
    categories: {                   // different categories of cookies
        required: {
            allowed: true,          // preselected
            description: 'These cookies are necessary for the website to function properly.',
            changeable: false       // user can not change this option
        },
        Analytics: {
            allowed: false,         // not preselected
            description: 'These cookies are used to analyze the user\'s behavior.'
        },
        'Share buttons': {
            allowed: false,
            description: 'These cookies enable the share functionality.'
        }
    }
});


setInterval(() => {
    showCookieSettings(cyn);
}, 500);

cyn.onAccept('analytics', function() {
    log('Analytics accepted');
});

cyn.onReject('analytics', function() {
    log('Analytics rejected');
});

cyn.onAccept('share buttons', function() {
    log('Share buttons accepted');
});

cyn.onReject('share buttons', function() {
    log('Share buttons rejected');
});

// buttons
document.getElementById('reviewbutton').onclick = () => cyn.reviewSettings();
document.getElementById('clearbutton').onclick = () => {
    clearCookie('_cyn');
    console.clear();
    location.reload(); 
};
