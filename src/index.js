'use strict';

import CookieYesNo from './cookieyesno.js';
import { log, showCookieSettings, clearCookie } from './helpers.js';

// make log globally visible
window.log = log;

const cyn = new CookieYesNo({
    text: {
        below: 'Take a look at the COOKIE_POLICY for more information.'
    },
    cookiePolicy: {
        url: '#',
        text: 'Cookie Policy'
    },
    categories: {                   // different categories of cookies
        required: {
            name: 'Required cookies',
            accepted: true,          // preselected
            description: 'These cookies are necessary for the website to function properly.',
            changeable: false       // user can not change this option
        },
        analytics: {
            name: 'Web Analytics',
            description: 'These cookies are used to analyze the user\'s behavior.',
            onAccept: [
                function() {
                    log('Analytics accepted');
                }
            ],
            onReject: [
                function() {
                    log('Analytics rejected');
                }
            ],
            onChange: [
                function(accepted) {
                    log('Cookie settings for analytics have changed to: ' + accepted);
                }
            ]
        },
        sharebuttons: {
            name: 'Share buttons',
            allowed: false,
            description: 'These cookies enable the share functionality.',
            reloadOnReject: false
        }
    },
    imprint: {
        url: '#',
        text: 'Imprint'
    },
    privacyPolicy: {
        url: '#',
        text: 'Privacy Policy'
    },
    version: '2020-05-31'
});


setInterval(() => {
    showCookieSettings(cyn);
}, 500);

cyn.onAccept('sharebuttons', function() {
    log('Share buttons accepted');
});

cyn.onReject('sharebuttons', function() {
    log('Share buttons rejected');
});

cyn.onChange('sharebuttons', function(accepted) {
    log('Cookie settings for share buttons have changed to: ' + accepted);
});
// buttons
document.getElementById('reviewbutton').onclick = () => cyn.reviewSettings();
document.getElementById('clearbutton').onclick = () => {
    clearCookie('_cyn');
    console.clear();
    location.reload(); 
};
