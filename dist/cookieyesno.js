var CookieYesNo = (function () {
    'use strict';

    /*!
    CookieYesNo | philippG777 | https://github.com/philippG777/cookieyesno | MIT License
    */

    // TODO:
    // Load blocked scripts
    // reload on reject (by default true) none

    var CookieYesNo = function CookieYesNo(config) {
        var this$1 = this;

        this.version = '1.1.0';
        this.cookie = { //  cookie handler
            set: function(data) {
                var d = new Date();
                d.setTime(d.getTime() + 90 * 86400000);  // 90 days
                document.cookie = '_cyn=' + data + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
            },
            get: function() {
                var parts = document.cookie.split(';');

                for(var i = 0; i < parts.length; i++) {
                    var pair = parts[i].trim().split('=');
                    if(pair[0] == '_cyn') { return pair[1]; }
                }
                return null;
            },
            clear: function() {
                document.cookie = '_cyn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;SameSite=Lax';
            }
        };

        this._config = config;

        var setDefaultValue = function (key, defaultValue) {
            if (this$1._config[key] === undefined)
                { this$1._config[key] = defaultValue; }
        };

        setDefaultValue('title', 'Cookie Settings');
        setDefaultValue('acceptAllButtonText', 'Accept all cookies');
        setDefaultValue('acceptSelectionButtonText', 'Accept selected cookies');

        // Create arrays for listeners if they do not already exist
        var listenerTypes = ['onAccept', 'onReject', 'onChange'];
        this._loopOverCategories(function (category) {
            listenerTypes.forEach(function (listenerType) {
                if(category[listenerType] === undefined)
                {
                    category[listenerType] = [];
                }
            });
        });

        this.banner = this._createBanner();
        this._applyStyle();
        this._addListeners();

        var storedData = this._load();

        if(storedData == null)
            { this.show(); }
        else if(storedData['version'] != this.version || // lib has been updated - get consent again to ensure its valid
            this._config.version != undefined && this._config.version != storedData['configversion'])
            {
            this.cookie.clear();
            this.show();
        }
        else
            { this._runListeners(); }
    };

    CookieYesNo.prototype._load = function _load () {
        var data = this.cookie.get();
        return (data == null)? null : JSON.parse(data);
    };

    CookieYesNo.prototype._save = function _save (settings) {
        var data = {
            version: this.version,
            settings: settings
        };

        if(this._config.version != undefined)
            { data.configversion = this._config.version; }

        this.cookie.set(JSON.stringify(data));
    };

    CookieYesNo.prototype.getSettings = function getSettings () {
        var data = this._load();
        if(data == null) { return {}; }
        else { return data['settings']; }
    };

    CookieYesNo.prototype.onChange = function onChange (category, callback) {
        this._config.categories[category].onChange.push(callback);
    };

    CookieYesNo.prototype.onAccept = function onAccept (category, callback) {
        if((this.getSettings())[category] === true)
            { callback(); }
        this._config.categories[category].onAccept.push(callback);
    };

    CookieYesNo.prototype.onReject = function onReject (category, callback) {
        if((this.getSettings())[category] === false)
            { callback(); }

        this._config.categories[category].onReject.push(callback);
    };

    CookieYesNo.prototype.reviewSettings = function reviewSettings () {
        this._bannerApplySettings(this.getSettings());
        this.show();
    };

    CookieYesNo.prototype._createBanner = function _createBanner () {
        var textAbove = (this._config.text != undefined && this._config.text.above != undefined)?
            this._config.text.above : 'This website uses cookies.\
                You can choose below which cookies may be stored on your device. You can allow all cookies using\
                the "Accept all cookies" button or accept a selection of cookies by using the\
                "Accept selected cookies" button and the checkboxes to select cookie categories.\
                You can review and revoke consent at any time using the "Review cookie settings" link in the footer.';

        var textBelow = (this._config.text != undefined && this._config.text.below != undefined)?
            this._config.text.below : '';
        var el = document.createElement('div');
        el.className = 'cyn-banner';
        var text = '<h3 style="font-size:28px;font-weight:bold;margin-top:16px;margin-bottom:20px">' +
            this._config.title + '</h3>';
        text += '<p>' + this._insertLinks(textAbove) + '</p>';


        // buttons
        text += '<button class="cyn-btn-accept-all">' + this._config.acceptAllButtonText + '</button>';
        text += '<button class="cyn-btn-save">' + this._config.acceptSelectionButtonText + '</button>';

        text += '<table class="cyn-categories"><tbody>';

        this._loopOverCategories(function (category, key) {
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
            { text += this._createLink(this._config.imprint) + ' '; }
        if(this._config.privacyPolicy != undefined)
            { text += this._createLink(this._config.privacyPolicy) + ' '; }
        if(this._config.cookiePolicy != undefined)
            { text += this._createLink(this._config.cookiePolicy); }

        text += '</div>';

        el.innerHTML = text;
        el.style.display = 'none';

        document.body.appendChild(el);
        return el;
    };

    CookieYesNo.prototype._bannerApplySettings = function _bannerApplySettings (settings) {
        var inputs = this.banner.getElementsByTagName('input');
        for(var i = 0; i < inputs.length; i++)
            { if(inputs[i].type == 'checkbox')
            {
                inputs[i].checked = (settings[inputs[i].value] != undefined &&
                    settings[inputs[i].value] == true)? true : false;
            } }
    };

    CookieYesNo.prototype._applyStyle = function _applyStyle () {
        // banner
        var style = this.banner.style;
        style.zIndex = 5000;            // move to front
        style.backgroundColor = '#fff'; // white background
        style.position = 'fixed';
            
        style.padding = '16px';
        style.boxShadow = '0 0 24px #aaa';
        style.borderRadius = '8px';

        style.fontSize = '14px';
        style.fontFamily = '"Trebuchet MS", Helvetica, sans-serif';
        style.color = '#444';

        style.overflowY = 'auto';
            
        if(window.innerWidth <= 768)// mobile
        {
            style.top = style.right = style.left = style.bottom = '16px';
            style.maxWidth = '80%';
        }
        else    // desktop (large screen)
        {
            style.right = style.bottom = '32px';
            style.maxHeight = '80vh';
            style.maxWidth = '40%';
        }
                

        // table
        style = this.banner.getElementsByTagName('table')[0].style;
        style.margin = '16px';

        var td = this.banner.getElementsByTagName('td');

        for(var i = 0; i < td.length; i++)
            { td[i].style.padding = '8px'; }

        // buttons
        var buttons = this.banner.getElementsByTagName('button');
        for (var i$1 = 0; i$1 < buttons.length; i$1++) {
            style = buttons[i$1].style;
                
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
        var aElems = this.banner.getElementsByTagName('a');
        for(var i$2 = 0; i$2 < aElems.length; i$2++)
            { aElems[i$2].style.color = '#333'; }
    };

    CookieYesNo.prototype._addListeners = function _addListeners () {
        var buttons = this.banner.getElementsByTagName('button');
        for(var i = 0; i < buttons.length; i++)
            { buttons[i].addEventListener('click', this._onButtonClick.bind(this)); }
    };
        
    CookieYesNo.prototype._onButtonClick = function _onButtonClick (e) {
        var newSettings = {};

        var className = e.target.className;
        if(className.indexOf('cyn-btn-accept-all') != -1) {
            for(var category in this._config.categories)
                { newSettings[category] = true; }
        } else if(className.indexOf('cyn-btn-save') != -1) {
            var inputs = this.banner.getElementsByTagName('input');
            for (var i  = 0; i < inputs.length; i++)
                { if(inputs[i].type == 'checkbox')
                    { newSettings[inputs[i].value] = inputs[i].checked; } }
        } else { return; }

        this.hide();
            
        this._runListeners(newSettings);

        this._save(newSettings);
    };

    CookieYesNo.prototype._runListeners = function _runListeners (settings) {
            var this$1 = this;

        var initialPageLoadExecution = (settings === undefined)? true : false;
        if(settings === undefined)  // default parameter
            { settings = this.getSettings(); }

        this._loopOverCategories(function (category, key) {
            category.onChange.forEach(function (listener) { return listener(settings[key]); });

            if(settings[key] === true)
            {
                this$1._activateScriptsOfCategory(key);
                category.onAccept.forEach(function (listener) { return listener(); });
            }
            else
            {
                category.onReject.forEach(function (listener) {
                    var reload = listener();
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
                        (this$1._config.categories[key]['reloadOnReject'] === undefined
                        || this$1._config.categories[key].reloadOnReject === true)
                        )
                    { location.reload(); }       // refresh page to stop script from running
                });
            }
        });
    };

    CookieYesNo.prototype._loopOverCategories = function _loopOverCategories (callback) {
        for(var key in this._config.categories)
        {
            callback(this._config.categories[key], key);
        }
    };

    CookieYesNo.prototype._insertLinks = function _insertLinks (text) {
        if(this._config.cookiePolicy != undefined)
            { text = text.replace('COOKIE_POLICY', this._createLink(this._config.cookiePolicy)); }
        if(this._config.privacyPolicy != undefined)
            { text = text.replace('PRIVACY_POLICY', this._createLink(this._config.privacyPolicy)); }
        if(this._config.imprint != undefined)
            { text =  text.replace('IMPRINT', this._createLink(this._config.imprint)); }

        return text;
    };

    CookieYesNo.prototype._createLink = function _createLink (link) {
        return '<a href="' + link.url + '">' + link.text + '</a>'
    };

    CookieYesNo.prototype._activateScriptsOfCategory = function _activateScriptsOfCategory (category) {
        var scripts = document.querySelectorAll('script[data-cyn-require=' + category + ']');
        scripts.forEach(function (script) {
            if (script.dataset['cynDone'] !== undefined)  // this script has already been activated
            {
                return;
            }
            script.dataset['cynDone'] = true;   // mark as done

            var newScript = document.createElement('script');
            if(script.dataset['cynSrc'] == undefined)   // inline script
            {
                newScript.innerText = script.innerText; // copy content
            }
            else// normal script
            {
                newScript.src = script.dataset['cynSrc'];   // copy src
            }
            document.body.appendChild(newScript);
        });
    };

    CookieYesNo.prototype.show = function show () { this.banner.style.display = 'block'; };
    CookieYesNo.prototype.hide = function hide () { this.banner.style.display = 'none'; };

    return CookieYesNo;

}());
