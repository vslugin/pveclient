const fs = require('fs');
const path = require('path');
const os = require("os");
const {spawn} = require('child_process');

const btoa = require('btoa');
const nodeFetch = require('node-fetch');
const repl = require("repl");

module.exports = class SpiceClientRunner {
    event = null;
    channel = null
    btnSelector = null;
    logSelector = null;
    configDir = null;
    configPath = null;

    constructor(channel, event, arg) {
        this.channel = channel;
        this.event = event;

        this.configDir = path.join(os.homedir(), '.config', 'pveclient');
        this.configPath = path.join(this.configDir, 'pveclient.conf');

        if (!fs.existsSync(this.configPath)) {
            this.reply(`Файл конфигурации не существует: ${this.configPath}`);
            return;
        }

        if (!this.initConfig()) {
            this.reply(`Не удаётся прочитать файл конфигурации: ${this.configPath}`);
            return;
        }

        this.open(arg);

        // this.reply(`Запустили!`);

    }

    reply(msg) {
        this.event.reply(this.channel, {action: 'reply', msg});
    }

    error(err) {
        this.event.reply(this.channel, {action: 'error', err});
    }

    open(arg) {

        console.log('open?', arg);

        const p = spawn('gedit', []);

        p.stdout.on('data', (data) => {
            console.log('ON DATA', data.toString());
        });

        p.stderr.on('data', (data) => {
            console.log('ON ERR DATA', data.toString());
        });

        p.on('close', (code) => {
            console.log('ON CLOSE', code);
            if(code === 0) {
                this.reply(`Сеанс работы с виртуальной машиной завершён успешно`);
            } else {
                this.error(`Сеанс работы с виртуальной машиной завершён аварийно`);
            }
        });

    }

    initConfig() {
        try {
            this.config = JSON.parse(fs.readFileSync(this.configPath));
        } catch (e) {
            return false;
        }
        return true;
    }
}
