const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = class Config {
    event = null;
    channel = null
    inpSelector = null;
    inpValue = null;
    config = null;
    configDir = null;
    configPath = null;

    constructor(channel, event, arg) {
        this.channel = channel;
        this.event = event;
        this.initConfig();
        if (arg.inpSelector && arg.inpValue) {
            this.inpSelector = arg.inpSelector;
            this.inpValue = arg.inpValue;
            this.update();
        } else {
            this.sendConfig();
        }
    }

    initConfig() {
        this.configDir = path.join(os.homedir(), '.config', 'pveclient');
        this.configPath = path.join(this.configDir, 'credentials.conf');
        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, {recursive: true});
        }

        if (fs.existsSync(this.configPath)) {
            try {
                this.config = JSON.parse(fs.readFileSync(this.configPath));
            } catch (e) {
                this.getConfigDefault();
            }
        } else {
            this.getConfigDefault();
        }
    }

    getConfigDefault() {
        this.config = {
            serverUrl: 'http://localhost/dbname/odata/standard.odata/',
            serverLogin: 'admin',
            serverPassword: ''
        };
        fs.writeFileSync(this.configPath, JSON.stringify(this.config));
    }

    update() {
        switch (this.inpSelector) {
            case '#server-url':
                this.config.serverUrl = this.inpValue;
                break;
            case '#server-login':
                this.config.serverLogin = this.inpValue;
                break;
            case '#server-password':
                this.config.serverPassword = this.inpValue;
                break;
        }

        fs.writeFileSync(this.configPath, JSON.stringify(this.config));
        this.sendConfig();
    }

    sendConfig() {
        this.event.reply(this.channel, {action: 'new-config', config: this.config});
    }

}
