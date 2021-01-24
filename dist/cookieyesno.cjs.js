'use strict';

/*!
CookieYesNo | philippG777 | https://github.com/philippG777/cookieyesno | MIT License
*/

// TODO:
// Load blocked scripts
// reload on reject (by default true) none

class CookieYesNo {
    constructor(config) {
        this.version = '1.1.0';
        this.cookie = {     //  cookie handler
            set: function(data) {
                let d = new Date();
                d.setTime(d.getTime() + 90 * 86400000);      // 90 days
                document.cookie = '_cyn=' + data + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
            },
            get: function() {
                const parts = document.cookie.split(';');

                for(let i = 0; i < parts.length; i++) {
                    const pair = parts[i].trim().split('=');
                    if(pair[0] == '_cyn') return pair[1];
                }
                return null;
            },
            clear: function() {
                document.cookie = '_cyn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;SameSite=Lax';
            }
        };

        this._config = config;

        const setDefaultValue = (key, defaultValue) => {
            if (this._config[key] === undefined)
                this._config[key] = defaultValue;
        };

        setDefaultValue('title', 'Cookie Settings');
        setDefaultValue('acceptAllButtonText', 'Accept all cookies');
        setDefaultValue('acceptSelectionButtonText', 'Accept selected cookies');

        // Create arrays for listeners if they do not already exist
        const listenerTypes = ['onAccept', 'onReject', 'onChange'];
        this._loopOverCategories((category) => {
            listenerTypes.forEach(listenerType => {
                if(category[listenerType] === undefined)
                {
                    category[listenerType] = [];
                }
            });
        });

        this.banner = this._createBanner();
        this._applyStyle();
        this._addListeners();

        const storedData = this._load();

        if(storedData == null)
            this.show();
        else if(storedData['version'] != this.version || // lib has been updated - get consent again to ensure its valid
            this._config.version != undefined && this._config.version != storedData['configversion'])
            {
            this.cookie.clear();
            this.show();
        }
        else
            this._runListeners();
    }

    _load() {
        const data = this.cookie.get();
        return (data == null)? null : JSON.parse(data);
    }

    _save(settings) {
        const data = {
            version: this.version,
            settings: settings
        };

        if(this._config.version != undefined)
            data.configversion = this._config.version;

        this.cookie.set(JSON.stringify(data));
    }

    getSettings() {
        const data = this._load();
        if(data == null) return {};
        else return data['settings'];
    }

    onChange(category, callback) {
        this._config.categories[category].onChange.push(callback);
    }

    onAccept(category, callback) {
        if((this.getSettings())[category] === true)
            callback();
        this._config.categories[category].onAccept.push(callback);
    }

    onReject(category, callback) {
        if((this.getSettings())[category] === false)
            callback();

        this._config.categories[category].onReject.push(callback);
    }

    reviewSettings() {
        this._bannerApplySettings(this.getSettings());
        this.show();
    }

    _createBanner() {
        const textAbove = (this._config.text != undefined && this._config.text.above != undefined)?
            this._config.text.above : 'This website uses cookies.\
                You can choose below which cookies may be stored on your device. You can allow all cookies using\
                the "Accept all cookies" button or accept a selection of cookies by using the\
                "Accept selected cookies" button and the checkboxes to select cookie categories.\
                You can review and revoke consent at any time using the "Review cookie settings" link in the footer.';

        const textBelow = (this._config.text != undefined && this._config.text.below != undefined)?
            this._config.text.below : '';
        const el = document.createElement('div');
        el.className = 'cyn-banner';
        let text = '<h3 style="font-size:28px;font-weight:bold;margin-top:16px;margin-bottom:20px">' +
            this._config.title + '</h3>';
        text += '<p>' + this._insertLinks(textAbove) + '</p>';


        // buttons
        text += '<button class="cyn-btn-accept-all">' + this._config.acceptAllButtonText + '</button>';
        text += '<button class="cyn-btn-save">' + this._config.acceptSelectionButtonText + '</button>';

        text += '<table class="cyn-categories"><tbody>';

        this._loopOverCategories((category, key) => {
            text += '<tr><td style="font-weight:bold">' + category.name + '</td><td>' + category.description + '</td><td>';
            text += '<input type="checkbox" value="' + key + '"'
                 + ((category.accepted)? ' checked' : '')
                 + ((category.changeable === true || category.changeable === undefined)? '' : ' disabled') + '/>';
            text += '</td></tr>';
        });

        text += '</tbody></table>';

        text += '<p>' + this._insertLinks(textBelow) + '</p>';

        // section for other links
        text += '<div class="cyn-other-links" style="padding-top:6px;padding-bottom:8px;font-size:12px">';

        if(this._config.imprint != undefined)
            text += this._createLink(this._config.imprint) + ' ';
        if(this._config.privacyPolicy != undefined)
            text += this._createLink(this._config.privacyPolicy) + ' ';
        if(this._config.cookiePolicy != undefined)
            text += this._createLink(this._config.cookiePolicy);

        text += '</div>';

        el.innerHTML = text;
        el.style.display = 'none';

        document.body.appendChild(el);
        return el;
    }

    _bannerApplySettings(settings) {
        let inputs = this.banner.getElementsByTagName('input');
        for(let i = 0; i < inputs.length; i++)
            if(inputs[i].type == 'checkbox')
            {
                inputs[i].checked = (settings[inputs[i].value] != undefined &&
                    settings[inputs[i].value] == true)? true : false;
            }
    }

    _applyStyle() {
        // banner
        let style = this.banner.style;
        style.zIndex = 5000;                // move to front
        style.backgroundColor = '#fff';     // white background
        style.position = 'fixed';
        
        style.padding = '16px';
        style.boxShadow = '0 0 24px #aaa';
        style.borderRadius = '8px';

        style.fontSize = '14px';
        style.fontFamily = '"Trebuchet MS", Helvetica, sans-serif';
        style.color = '#444';

        style.overflowY = 'auto';
        
        if(window.innerWidth <= 768)    // mobile
        {
            style.top = style.right = style.left = style.bottom = '16px';
            style.maxWidth = '80%';
        }
        else        // desktop (large screen)
        {
            style.right = style.bottom = '32px';
            style.maxHeight = '80vh';
            style.maxWidth = '40%';
        }
            

        // table
        style = this.banner.getElementsByTagName('table')[0].style;
        style.margin = '16px';

        const td = this.banner.getElementsByTagName('td');

        for(let i = 0; i < td.length; i++)
            td[i].style.padding = '8px';

        // buttons
        const buttons = this.banner.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; i++) {
            style = buttons[i].style;
            
            style.boxSizing = 'border-box';
            style.cursor = 'pointer';
            style.margin = '12px';
            style.marginLeft = '10%';
            style.borderRadius = '4px';
            style.border = '0px';
            style.backgroundColor = '#48c774';
            style.color = 'white';
            style.fontSize = '18px';
            style.padding = '8px';
            style.paddingLeft = style.paddingRight = '12px';
            style.display = 'block';
        }

        // links
        const aElems = this.banner.getElementsByTagName('a');
        for(let i = 0; i < aElems.length; i++)
            aElems[i].style.color = '#333';
    }

    _addListeners() {
        const buttons = this.banner.getElementsByTagName('button');
        for(let i = 0; i < buttons.length; i++)
            buttons[i].addEventListener('click', this._onButtonClick.bind(this));
    }
    
    _onButtonClick(e) {
        let newSettings = {};

        const className = e.target.className;
        if(className.indexOf('cyn-btn-accept-all') != -1) {
            for(const category in this._config.categories)
                newSettings[category] = true;
        } else if(className.indexOf('cyn-btn-save') != -1) {
            const inputs = this.banner.getElementsByTagName('input');
            for (let i  = 0; i < inputs.length; i++)
                if(inputs[i].type == 'checkbox')
                    newSettings[inputs[i].value] = inputs[i].checked;
        } else return;

        this.hide();
        
        this._runListeners(newSettings);

        this._save(newSettings);
    }

    _runListeners(settings) {
        const initialPageLoadExecution = (settings === undefined)? true : false;
        if(settings === undefined)      // default parameter
            settings = this.getSettings();

        this._loopOverCategories((category, key) => {
            category.onChange.forEach(listener => listener(settings[key]));

            if(settings[key] === true)
            {
                this._activateScriptsOfCategory(key);
                category.onAccept.forEach(listener => listener());
            }
            else
            {
                category.onReject.forEach(listener => {
                    const reload = listener();
                    /*
                        When do we need to reload the page?
                        -----------------------------------
                        The page gets reloaded when the user rejects a cookie afterwards,
                        and:
                            * the callback routine thats executed before returns false
                            * the reloadOnReject-option in the config is not set or
                                is set to true
                    */
                    if(!initialPageLoadExecution && reload !== false &&
                        (this._config.categories[key]['reloadOnReject'] === undefined
                        || this._config.categories[key].reloadOnReject === true)
                        )
                    location.reload();           // refresh page to stop script from running
                });
            }
        });
    }

    _loopOverCategories(callback) {
        for(const key in this._config.categories)
        {
            callback(this._config.categories[key], key);
        }
    }

    _insertLinks(text) {
        if(this._config.cookiePolicy != undefined)
            text = text.replace('COOKIE_POLICY', this._createLink(this._config.cookiePolicy));
        if(this._config.privacyPolicy != undefined)
            text = text.replace('PRIVACY_POLICY', this._createLink(this._config.privacyPolicy));
        if(this._config.imprint != undefined)
            text =  text.replace('IMPRINT', this._createLink(this._config.imprint));

        return text;
    }

    _createLink(link) {
        return '<a href="' + link.url + '">' + link.text + '</a>'
    }

    _activateScriptsOfCategory(category) {
        const scripts = document.querySelectorAll('script[data-cyn-require=' + category + ']');
        scripts.forEach(script => {
            if (script.dataset['cynDone'] !== undefined)  // this script has already been activated
            {
                return;
            }
            script.dataset['cynDone'] = true;       // mark as done

            const newScript = document.createElement('script');
            if(script.dataset['cynSrc'] == undefined)       // inline script
            {
                newScript.innerText = script.innerText;     // copy content
            }
            else    // normal script
            {
                newScript.src = script.dataset['cynSrc'];   // copy src
            }
            document.body.appendChild(newScript);
        });
    }

    show() { this.banner.style.display = 'block'; }
    hide() { this.banner.style.display = 'none'; }
}

module.exports = CookieYesNo;
