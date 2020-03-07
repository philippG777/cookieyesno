'use strict';

function log(message) {
    document.getElementById('log').innerHTML += '<li>' + message + '</li>'
}

var cyn = new CookieYesNo({
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
