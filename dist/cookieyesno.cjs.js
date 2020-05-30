'use strict';

/*!
CookieYesNo | philippG777 | https://github.com/philippG777/cookieyesno | MIT License
*/

class CookieYesNo {
    constructor(config) {
        this.cookie = {     //  cookie handler
            set: function(cname, data) {
                let d = new Date();
                d.setTime(d.getTime() + 90 * 86400000);      // 90 days
                document.cookie = cname + '=' + data + ';expires=' + d.toUTCString() + ';path=/';
            },
            get: function(cname) {
                const parts = document.cookie.split(';');

                for(let i = 0; i < parts.length; i++) {
                    const pair = parts[i].trim().split('=');
                    if(pair[0] == cname) return pair[1];
                }
                return null;
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

        if(this._load() == null)
            this.show();
        else
            this._runAcceptRejectListeners();
    }

    _load() {
        const data = this.cookie.get('_cyn');
        return (data == null)? null : JSON.parse(data);
    }

    _save(settings) {
        this.cookie.set('_cyn', JSON.stringify(settings));
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

    getSettings() {
        const settings = this._load();
        if(settings == null) return {};
        else return settings;
    }

    reviewSettings() {
        this._bannerApplySettings(this.getSettings());
        this.show();
    }

    _createBanner() {
        const el = document.createElement('div');
        el.className = 'cyn-banner';
        let text = '<h3 style="font-size: 28px; font-weight: bold;">This site uses cookies</h3>';
        text += '<p>' + this._config.text + '</p>';
        text += '<table class="cyn-categories"><tbody>';

        for(const key in this._config.categories) {
            const cat = this._config.categories[key];

            text += '<tr><td style="font-weight:bold;">' + key + '</td><td>' + cat.description + '</td><td>';
            text += '<input type="checkbox" value="' + key + '"'
                 + ((cat.allowed)? ' checked' : '')
                 + ((cat.changeable === true || cat.changeable === undefined)? '' : ' disabled') + '/>';
            text += '</td></tr>';
        }

        text += '</tbody></table>';

        // Cookie Policy link
        text += '<p>For detailed information take a look at the <a href="' + this._config.cookiePolicy +
            '">Cookie Policy</a>.</p>';

        text += '<button class="cyn-btn-save">Save Settings</button>';
        text += '<button class="cyn-btn-accept-all">Accept all</button>';

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
        
        if(window.innerWidth <= 768)    // mobile
            style.right = style.left = style.bottom = '16px';
        else        // desktop (large screen)
            style.right = style.bottom = '32px';

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
            style.margin = '8px';
            style.marginTop = '24px';
            style.borderRadius = '4px';

            if(buttons[i].className == 'cyn-btn-accept-all') {
                style.border = '0px';
                style.backgroundColor = '#48c774';
                style.color = 'white';
                style.fontWeight = 'bold';
                style.fontSize = '24px';
                style.padding = '12px';
                style.paddingLeft = style.paddingRight = '16px';
            } else {
                style.backgroundColor = 'white';
                style.color = '#999';
                style.border = '2px solid #bbb';
                style.fontSize = '20px';
                style.padding = '8px';
            }
        }
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

    show() { this.banner.style.display = 'block'; }
    hide() { this.banner.style.display = 'none'; }
}

module.exports = CookieYesNo;
