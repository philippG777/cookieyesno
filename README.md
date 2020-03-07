# cookieyesno
Easy to use GDPR-complient cookie-banner

Take a look at it in action on a real site: https://watchaccuracy.com/

## Usage


```js
// using packages
import CookieYesNo from 'cookieyesno';

// or simply include the dist/cookieyesno.min.js file in the html

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

## Modify the banner
It's pretty simple: just use CSS-rules.
The following classes are available:

* `.cyn-banner`: main banner element
* `.cyn-categories`: table containing the different cookie categories
* `.cyn-btn-save`: save settings button 
* `.cyn-btn-accept-all`: accept all button
