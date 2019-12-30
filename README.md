# cookieyesno
Easy to use GDPR-complient cookie-banner

## Usage

```js
import CookieYesNo from 'cookieyesno';

const cyn = new CookieYesNo({
	text: 'This website uses cookies. You can select below which cookies will be stored on your device.',
    cookiePolicy: '<LINK TO YOUR COOKIE POLICY>',
    categories: {                   // different categories of cookies
        required: {
            allowed: true,          // preselected
            description: 'These cookies are necessary for the website to function properly.',
            changeable: false       // user can not change this option
        },
        Analytics: {
            allowed: false,         // not preselected
            description: 'These cookies are used to analyze the user\'s behavior.'
        }
    }
});

cyn.onChange((settings) => {
    // cookie settings have changed
});

// Note: all categories are transformed to lowercase (Analytics -> analytics)
cyn.onAccept('analytics', () => {
    // analytics-cookies are accepted
});

cyn.onReject('analytics', () => {
    // analytics-cookies are not allowed
});

// get current cookie settings
cyn.getSettings(); // example-response { required: true, analytics: false }

cyn.reviewSettings();       // open the banner to let the user review the settings
```
