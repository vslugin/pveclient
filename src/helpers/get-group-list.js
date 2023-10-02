const fs = require('fs');
const path = require('path');
const os = require("os");
const btoa = require('btoa');
const nodeFetch = require('node-fetch');
const xlsx = require('node-xlsx').default;

module.exports = class GetGroupList {
    event = null;
    channel = null
    btnSelector = null;
    logSelector = null;
    destinationDir = null;
    configDir = null;
    configPath = null;
    departments = [];
    resDir = null;
    res = [];

    constructor(channel, event, arg) {
        this.channel = channel;
        this.event = event;
        this.btnSelector = arg.btnSelector;
        this.logSelector = arg.logSelector;
        this.destinationDir = arg.destinationDir;

        // сигнал на блокировку кнопки
        this.lock();

        this.configDir = path.join(os.homedir(), '.config', 'pveclient');
        this.configPath = path.join(this.configDir, 'credentials.conf');

        if (!fs.existsSync(this.configPath)) {
            this.reply(`Файл конфигурации не существует: ${this.configPath}`);
            // сигнал на разблокировку кнопки
            this.unlock();
            return;
        }

        if (!this.initConfig()) {
            this.reply(`Не удаётся прочитать файл конфигурации: ${this.configPath}`);
            // сигнал на разблокировку кнопки
            this.unlock();
            return;
        }

        // пробуем подготовить каталог для записи выходных данных
        try {
            this.resDir = path.join(this.destinationDir, 'Помогатор', 'Список групп');
            if (!fs.existsSync(this.resDir)) {
                this.reply(`Создаём каталог для файлов результата: ${this.resDir}`);
                fs.mkdirSync(this.resDir, {recursive: true});
                this.reply('Успешно');
            } else {
                this.reply(`Каталог для файлов результата существует: ${this.resDir}`);
            }
        } catch (e) {
            this.reply(`Ошибка: ${e.toString()}`);
            // сигнал на разблокировку кнопки
            this.unlock();
            return;
        }

        // спагетти: получаем отделы
        this.getDepartments(async () => {
            // идём по отделам
            for (const dep of this.departments) {
                // формируем группы для каждого отдела
                await this.getGroups(dep);
            }
            // сигнал на разблокировку кнопки
            this.unlock();
        });
    }

    reply(msg) {
        this.event.reply(this.channel, this.appendLog(msg));
    }

    appendLog(msg) {
        this.res.push(msg);
        return {action: 'log', logSelector: this.logSelector, logData: this.res.join('\n')};
    }

    lock() {
        this.event.reply(this.channel, {action: 'lock', btnSelector: this.btnSelector});
        this.reply('Начали');
    }

    unlock() {
        this.event.reply(this.channel, {action: 'unlock', btnSelector: this.btnSelector});
        this.reply('Закончили');
    }

    getDepartments(cb) {
        this.reply('Получаем список отделов:');
        const link = `${this.config.serverUrl}/Catalog_УчебныеГруппы?$format=json&$filter=IsFolder eq true&$select=Ref_Key,Description`;
        nodeFetch(link, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${btoa(`${this.config.serverLogin}:${this.config.serverPassword}`)}`
            }
        }).then(async result => {
            if (result) {
                const data = await result.json();
                this.departments = data.value;
                this.reply('Успешно.');
                cb();
            }
        }).catch(e => {
            this.reply(`Ошибка: ${e.toString()}`);
            this.unlock();
        });
    }

    getGroups(department) {
        const name = department.Description;
        const id = department.Ref_Key;
        this.reply(`Формируем списки групп для отдела: ${name} (${id})`);
        this.reply(`-- создаём каталог: ${name}`);
        const depDir = path.join(this.resDir, name);
        if (fs.existsSync(depDir)) {
            fs.rmSync(depDir, {recursive: true});
        }
        if (!fs.existsSync(depDir)) {
            fs.mkdirSync(depDir);
        }

        const link = `${this.config.serverUrl}/Catalog_УчебныеГруппы?$format=json&$filter=Parent_Key eq guid'${id}'&$select=Ref_Key,Description`;
        return new Promise((async (resolve_, reject_) => {
            try {
                const groups = new Promise(((resolve, reject) => {
                    nodeFetch(link, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Basic ${btoa(`${this.config.serverLogin}:${this.config.serverPassword}`)}`
                        }
                    }).then(async result => {
                        if (result) {
                            const data = await result.json();
                            resolve(data.value);
                        }
                    }).catch(e => {
                        reject(e.toString());
                    });
                }));

                // идём по группам
                for (const gr of await groups) {
                    const name = gr.Description;
                    const id = gr.Ref_Key;

                    //if (name === 'РЭТ-22-1с') {
                        this.reply(`Формируем файл для группы: ${name} (${id})`);
                        const groupFile = path.join(depDir, name) + '.xlsx';
                        if (fs.existsSync(groupFile)) {
                            fs.rmSync(groupFile);
                        }
                        await this.createFileForGroup(groupFile, gr);
                    //}


                }

                resolve_('ok');

            } catch (e) {
                this.reply(`Ошибка: ${e.toString()}`);
            }
        }));


    }

    initConfig() {
        try {
            this.config = JSON.parse(fs.readFileSync(this.configPath));
        } catch (e) {
            return false;
        }
        return true;
    }

    createFileForGroup(groupFile, gr) {
        const name = gr.Description;
        const id = gr.Ref_Key;
        // fs.writeFileSync(groupFile, `Здесь будет содержимое файла для группы ${JSON.stringify(gr)}`);//
        const link = `${this.config.serverUrl}/Document_ПриказОДвиженииКонтингента?$format=json&$select=Ref_Key,Number,Date,Заголовок,СписокСтудентов&$filter=УчебнаяГруппа_Key eq guid'${id}'`;
        return new Promise(async (resolve_, reject_) => {
            try {
                const prikazy = new Promise(async (resolve, reject) => {
                    nodeFetch(link, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Basic ${btoa(`${this.config.serverLogin}:${this.config.serverPassword}`)}`
                        }
                    }).then(async result => {
                        if (result) {
                            const data = await result.json();
                            resolve(data.value);
                        }
                    }).catch(e => {
                        reject(e.toString());
                    });
                });

                if (fs.existsSync(groupFile)) {
                    fs.rmSync(groupFile);
                }

                // fs.writeFileSync(groupFile, this.getDataHead());

                const data = [];
                //data.push(this.getDataHead());

                // идём по приказам (их для спиской людей в группе может быть больше одного, поэтому объодим все)
                for (const pr of await prikazy) {
                    const studsList = pr['СписокСтудентов'];
                    for (const st of studsList) {

                        if (st['Студент_Key'] !== '00000000-0000-0000-0000-000000000000') {
                            const line = await this.getLine(pr, st);
                            data.push(line)
                            // fs.appendFileSync(groupFile, line);
                        }

                    }
                }

                const sortedData = data.sort((a, b) => a[0].localeCompare(b[0]));
                sortedData.unshift(this.getDataHead());

                const buffer = xlsx.build([{name: "Список группы", data}]); // Returns a buffer
                fs.writeFileSync(groupFile, buffer);

                resolve_('ok');

            } catch (e) {
                this.reply(`Ошибка: ${e.toString()}`);
            }
        });
    }

    getDataHead() {
        return [
            'ФИО',
            'MOODLE:username',
            'MOODLE:password',
            'MOODLE:lastname',
            'MOODLE:firstname',
            'MOODLE:email',
            'Приказ:номер',
            'Приказ:дата',
            'Приказ:заголовок'
        ];
    }

    async getLine(pr, st) {
        const id = pr.Ref_Key;
        const title = String(pr['Заголовок']).trim();
        const number = String(pr.Number).trim();
        const date = String(pr.Date).trim();
        const stKey = st['Студент_Key'];
        const info = await this.getUserInfo(stKey);

        const fio = info.st.Description;
        const parsedFio = fio.split(' ');

        const username = this.translit(`${parsedFio[0]}_${(parsedFio[1])[0]}_${(parsedFio[2])[0]}`);
        const password = this.generatePass();

        const lastname = `${parsedFio[0]}`;
        const firstname = `${parsedFio[1]} ${parsedFio[2]}`;
        const email = this.getEmail(info);

        return [
            fio,
            username,
            password,
            lastname,
            firstname,
            email,
            number,
            date,
            title
        ];
    }

    async getUserInfo(stKey) {
        const linkStud = `${this.config.serverUrl}/Catalog_Студенты(guid'${stKey}')?$format=json`;
        const linkAnketa = `${this.config.serverUrl}/Catalog_Студенты(guid'${stKey}')/АнкетаАбитуриента?$format=json`;
        return new Promise(async (resolve_, reject_) => {
            try {
                const res = {
                    st: await new Promise(async (resolve, reject) => {
                        nodeFetch(linkStud, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Basic ${btoa(`${this.config.serverLogin}:${this.config.serverPassword}`)}`
                            }
                        }).then(async result => {
                            if (result) {
                                const data = await result.json();
                                // console.log('STUDENT DATA?', data);
                                resolve(data);
                            }
                        }).catch(e => {
                            // reject(e.toString());
                            resolve([]);
                        });
                    }),
                    ank: await new Promise(async (resolve, reject) => {
                        nodeFetch(linkAnketa, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Basic ${btoa(`${this.config.serverLogin}:${this.config.serverPassword}`)}`
                            }
                        }).then(async result => {
                            if (result) {
                                const data = await result.json();
                                // console.log('ANKETA DATA?', data);
                                resolve(data);
                            }
                        }).catch(e => {
                            //reject(e.toString());
                            resolve([]);
                        });
                    })
                };
                resolve_(res);
            } catch (e) {
                reject_(e);
            }
        });
    }

    getEmail(info) {
        if (!info.ank['КонтактнаяИнформация']) {
            return '';
        }
        const contacts = info.ank['КонтактнаяИнформация'];
        const contactEmail = contacts.find(c => {
            return c['Тип'] === 'АдресЭлектроннойПочты';
        });
        if (contactEmail['Представление']) {
            return contactEmail['Представление'];
        }
        return '';
    }

    translit(text) {
        return text.replace(/([а-яё])|([\s_-])|([^a-z\d])/gi,
            function (all, ch, space, words, i) {
                if (space || words) {
                    return space ? '_' : '';
                }
                var code = ch.charCodeAt(0),
                    index = code == 1025 || code == 1105 ? 0 :
                        code > 1071 ? code - 1071 : code - 1039,
                    t = ['yo', 'a', 'b', 'v', 'g', 'd', 'e', 'zh',
                        'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p',
                        'r', 's', 't', 'u', 'f', 'h', 'c', 'ch', 'sh',
                        'shch', '', 'y', '', 'e', 'yu', 'ya'
                    ];
                return t[index];
            }
        );
    }

    generatePass() {
        const generator = require('generate-password');
        return generator.generate({
            length: 10,
            numbers: true,
            uppercase: true
        });
    }
}
