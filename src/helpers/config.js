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

        // здесь нужно будет ходить на внешний сервер и если там есть конфиг, забирать его
        // и обновлять текущий конфиг

        this.sendConfig();
    }

    initConfig() {
        this.configDir = path.join(os.homedir(), '.config', 'pveclient');
        this.configPath = path.join(this.configDir, 'pveclient.conf');
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
            servers: [
                {title: 'Этот компьютер', addr: 'localhost', port: 8006}
            ]
        };
        fs.writeFileSync(this.configPath, JSON.stringify(this.config));
    }

    update() {
        this.config.servers = this.inpValue;
        fs.writeFileSync(this.configPath, JSON.stringify(this.config));
        this.sendConfig();
    }

    sendConfig() {
        this.event.reply(this.channel, {action: 'new-config', config: this.config});
    }

}
