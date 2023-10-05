const fs = require('fs');
const os = require('os');
const path = require('path');
const fetch = require('node-fetch');

module.exports = class Config {
    event = null;
    channel = null
    inpValue = null;
    config = null;
    configDir = null;
    configPath = null;

    constructor(channel, event, arg) {
        this.channel = channel;
        this.event = event;
        this.initConfig();
        this.getConfigFromServer().then(configJson => {
            if (this.arraysAreEqual(configJson.servers, this.config.servers)) {
                event.reply(channel, {action: 'reply', msg: 'Конфигурационный файл актуален'});
            } else {
                this.config = configJson;
                fs.writeFileSync(this.configPath, JSON.stringify(this.config));
                event.reply(channel, {action: 'reply', msg: 'Конфигурационный файл успешно обновлён'});
            }
        }).catch(error => {
            event.reply(channel, {action: 'error', err: error.toString()});
        }).finally(() => {
            this.sendConfig();
        });
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
            'update-url': "",
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

    async getConfigFromServer() {
        return new Promise((resolve, reject) => {
            if (this.config['update-url'] && this.config['update-url'].length) {
                const url = this.config['update-url'];
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                fetch(url, {method: 'GET'})
                    .then((response) => response.text())
                    .then((data) => {
                        try {
                            const configJSON = JSON.parse(data);
                            resolve(configJSON);
                        } catch (e) {
                            reject('Некорректный формат конфигурационного файла на сервере');
                        }
                    })
                    .catch((error) => {
                        console.log('ERROR???', error);
                        reject('Не удалось получить конфигурацию с сервера');
                    });

            } else {
                reject('Сервер обновлений не задан в конфигурационном файле');
            }
        });
    }

    arraysAreEqual(array1, array2) {
        if (array1.length !== array2.length) {
            return false;
        }
        return array1.every(item1 => array2.some(item2 =>
            JSON.stringify(item1) === JSON.stringify(item2)
        ));
    }
}
