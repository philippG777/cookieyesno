'use strict';

/*!
CookieYesNo | philippG777 | https://github.com/philippG777/cookieyesno | MIT License
*/

export default class CookieYesNo {
    constructor(config) {
        this.version = '1.0.4';
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

        // listeners
        this._changeListeners = [];
        this._acceptListeners = [];  
        this._rejectListeners = [];      

        this.banner = this._createBanner();
        this._applyStyle();
        this._addListeners();

        const storedData = this._load()

        if(storedData == null)
            this.show();
        else if(storedData['version'] != this.version) {
            // lib has been updated - get consent again to ensure data integrity
            this.cookie.clear()
            this.show();
        }
        else
            this._runAcceptRejectListeners();
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
        this.cookie.set(JSON.stringify(data));
    }

    getSettings() {
        const data = this._load();
        if(data == null) return {};
        else return data['settings'];
    }

    onChange(cb) {
        this._changeListeners.push(cb);
    }

    onAccept(name, cb) {
        if((this.getSettings())[name] === true)
            cb();
        else
            this._acceptListeners.push({
                name: name,
                cb: cb
            });
    }

    onReject(name, cb) {
        if((this.getSettings())[name] === false)
            cb();
        else
            this._rejectListeners.push({
                name: name,
                cb: cb
            });
    }

    reviewSettings() {
        this._bannerApplySettings(this.getSettings());
        this.show();
    }

    _createBanner() {
        const el = document.createElement('div');
        el.className = 'cyn-banner';
        let text = '<h3 style="font-size:28px;font-weight:bold;margin-top:16px;margin-bottom:20px">Cookie Settings</h3>';
        text += '<p>' + this._config.text + '</p>';


        // buttons
        text += '<button class="cyn-btn-accept-all">Accept all cookies</button>';
        text += '<button class="cyn-btn-save">Accept selection</button>';

        text += '<table class="cyn-categories"><tbody>';

        for(const key in this._config.categories) {
            const cat = this._config.categories[key];

            text += '<tr><td style="font-weight:bold">' + key + '</td><td>' + cat.description + '</td><td>';
            text += '<input type="checkbox" value="' + key + '"'
                 + ((cat.allowed)? ' checked' : '')
                 + ((cat.changeable === true || cat.changeable === undefined)? '' : ' disabled') + '/>';
            text += '</td></tr>';
        }

        text += '</tbody></table>';

        // Cookie Policy link
        text += '<p>For detailed information take a look at the <a href="' + this._config.cookiePolicy.url +
            '">' + this._config.cookiePolicy.text + '</a>.</p>';

        // section for other links
        text += '<div class="cyn-other-links" style="padding-top: 16px; padding-bottom: 10px">';

        if(this._config.imprint != undefined)
            text += '<a href="' + this._config.imprint.url + '">' + this._config.imprint.text + '</a> ';
        if(this._config.privacyPolicy != undefined)
            text += '<a href="' + this._config.privacyPolicy.url + '">' + this._config.privacyPolicy.text + '</a> ';

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
                inputs[i].checked = (settings[inputs[i].value.toLowerCase()] != undefined &&
                    settings[inputs[i].value.toLowerCase()] == true)? true : false;
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
            style.top = style.right = style.left = style.bottom = '16px';
        else        // desktop (large screen)
        {
            style.right = style.bottom = '32px';
            style.maxHeight = '80vh';
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
                newSettings[category.toLowerCase()] = true;     // turn Analytics to analytics
        } else if(className.indexOf('cyn-btn-save') != -1) {
            const inputs = this.banner.getElementsByTagName('input');
            for (let i  = 0; i < inputs.length; i++)
                if(inputs[i].type == 'checkbox')
                    newSettings[inputs[i].value.toLowerCase()] = inputs[i].checked;
        } else return;

        this.hide();

        // run CBs
        for(let i = 0; i < this._changeListeners.length; i++)
            this._changeListeners[i](newSettings);
        
        this._runAcceptRejectListeners(newSettings);

        this._save(newSettings);
    }

    _runAcceptRejectListeners(settings) {
        if(settings === undefined)      // default parameter
            settings = this.getSettings();

        for(let i = 0; i < this._acceptListeners.length; i++)
            if(settings[this._acceptListeners[i].name] === true)
                this._acceptListeners[i].cb();

        for(let i = 0; i < this._rejectListeners.length; i++)
            if(settings[this._rejectListeners[i].name] === false)
                this._rejectListeners[i].cb();
    }

    show() { this.banner.style.display = 'block' }
    hide() { this.banner.style.display = 'none' }
};
