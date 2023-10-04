const fs = require('fs');
const path = require('path');
const os = require("os");
const {spawn} = require('child_process');
const fetch = require('node-fetch');

module.exports = class SpiceClientRunner {
    configDir = null;
    configPath = null;
    selectedServer = null;
    PVETicket = null;
    PVE_CSRFPreventionToken = null;
    PVEMachines = [];

    constructor() {

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

    }

    setSelectedServer(channel, event, arg) {
        this.selectedServer = arg.selectedServer;
        console.log('Selected Server', this.selectedServer);
    }

    async getVirtualMachines(channel, event, arg) {
        await this.getTicketAndMachines(channel, event, arg);
    }

    async runVirtViewer(channel, event, arg) {

        try {
            const proxyFileData = await this.proxyPVE(arg.virtualMachine, this.selectedServer, this.PVETicket, this.PVE_CSRFPreventionToken);

            const fileStrings = ['[virt-viewer]'];

            const fields = [
                'title',
                'delete-this-file',
                'release-cursor',
                'tls-port',
                'type',
                'proxy',
                'secure-attention',
                'password',
                'host-subject',
                'toggle-fullscreen',
                'ca',
                'host',
            ];

            fields.forEach(field => {
                fileStrings.push(`${field}=${proxyFileData[field]}`);
            });

            const proxyFileName = `${this.configDir}/proxy-spice.vv`;

            if (fs.existsSync(proxyFileName)) {
                fs.rmSync(proxyFileName);
            }

            fs.writeFileSync(proxyFileName, fileStrings.join("\n"));

            // console.log('SEE FILE', proxyFileName);

            const p = spawn('/usr/bin/remote-viewer', [proxyFileName]);

            p.stdout.on('data', (data) => {
               // console.log('ON DATA', data.toString());
            });

            p.stderr.on('data', (data) => {
               // console.log('ON ERR DATA', data.toString());
            });

            p.on('close', (code) => {
                console.log('ON CLOSE', code);
                if (code === 0) {
                    this.reply(channel, event, `Сеанс работы с виртуальной машиной завершён успешно`);
                } else {
                    this.error(channel, event, `Сеанс работы с виртуальной машиной завершён аварийно`);
                }
            });

        } catch (e) {
            this.error(channel, event, 'Ошибка: ' + e.toString());
        }
    }

    replyWithVMs(channel, event, vms) {
        event.reply(channel, {action: 'virtual-machines', vms});
    }

    reply(channel, event, msg) {
        event.reply(channel, {action: 'reply', msg});
    }

    error(channel, event, err) {
        event.reply(channel, {action: 'error', err});
    }

    async getTicketAndMachines(channel, event, arg) {

        const PVEAuthURL = `https://${arg.addr}:${arg.port}/api2/extjs/access/ticket`;
        const PVEResourcesURL = `https://${arg.addr}:${arg.port}/api2/json/cluster/resources`;

        try {
            const authData = await this.authPVE(PVEAuthURL, arg.login, arg.password);
            if (!!authData.success) {
                this.PVETicket = authData.data.ticket;
                this.PVE_CSRFPreventionToken = authData.data.CSRFPreventionToken;
            } else {
                this.error(channel, event, `Неверные данные для входа`);
                return;
            }
        } catch (e) {
            this.error(channel, event, JSON.stringify(e));
            return;
        }

        try {
            const resourcesData = await this.resourcesPVE(PVEResourcesURL, this.PVETicket);
            this.PVEMachines = resourcesData.data.filter(itm => {
                return ['qemu'].includes(itm.type);
            })

            this.replyWithVMs(channel, event, this.PVEMachines);

        } catch (e) {
            console.log('ERROR RESOURCES?', e);
            this.error(channel, event, JSON.stringify(e));
        }
    }

    initConfig() {
        try {
            this.config = JSON.parse(fs.readFileSync(this.configPath));
        } catch (e) {
            return false;
        }
        return true;
    }

    authPVE(url, login, password) {

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        };

        const body = `username=${login}&password=${password}&realm=pve&new-format=1`;

        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'POST',
                headers: headers,
                body: body,
            })
                .then((response) => response.json())
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    resourcesPVE(url, ticket) {

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'Cookie': ` PVELangCookie=ru; PVEAuthCookie=${encodeURIComponent(ticket)}`
        };

        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'GET',
                headers: headers,
            })
                .then((response) => response.json())
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    proxyPVE(virtualMachine, server, ticket, CSRFPreventionToken) {

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        const url = `https://${server.addr}:${server.port}/api2/extjs/nodes/${virtualMachine.node}/${virtualMachine.id}/spiceproxy`;
        const headers = {
            'CSRFPreventionToken': CSRFPreventionToken,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': ` PVELangCookie=ru; PVEAuthCookie=${encodeURIComponent(ticket)}`
        };

        const body = `proxy=${server.addr}`;

        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'POST',
                headers: headers,
                body: body
            })
                .then((response) => response.json())
                .then((data) => {
                    resolve(data.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
}
