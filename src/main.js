const {app, BrowserWindow, Menu, ipcRenderer, ipcMain, dialog, nativeImage} = require('electron');
const path = require('path');
const url = require("url");

const debugEnabled = true;
const showMenu = true;
const showFrame = true;
const maximize = false;

let win;

const createWindow = () => {
    win = new BrowserWindow({
        frame: showFrame,
        width: 1600,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'icon.icns')
    });

    // Open the DevTools.
    if (debugEnabled) {
        // Open the DevTools.
        win.webContents.openDevTools()
    }

    if (maximize) {
        win.maximize();
    }


    // win.loadFile('src/index.html');

    win.loadURL(
        url.format({
            // тут нужно уточнить, что путь к файлу index.html будет валиден для
            // Angular 6+ приложения. Если у вас версия ниже, то используйте
            // следующий путь - /dist/index.html
            pathname: path.join(__dirname, '..','angular_src/dist/angular_src/index.html'),
            protocol: "file:",
            slashes: true
        })
    );

    win.on('close', (event) => {
        // Отменяем стандартное действие закрытия приложения
        event.preventDefault();
        // Можно добавить здесь дополнительную логику, если необходимо
        // console.log('Попытка закрыть приложение. Выполните подтверждение.');

        dialog.showMessageBox(win, {
            type: 'question',
            icon: path.join(__dirname, "icon.png"),
            buttons: ['OK', 'Отмена'],
            title: 'Закрытие приложения',
            message: 'Действительно завершить работу приложения?',
        }).then(response => {
            if (response.response === 0) {
                win.destroy()
                app.quit();
            }
        });
    });

}

app.whenReady().then(() => {
    createWindow();

    if (!showMenu) {
        Menu.setApplicationMenu(null);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })
});

if (app.dock) {
    app.dock.setIcon(path.join(__dirname, 'icon.png'));
}

app.on('window-all-closed', (event) => {
    app.quit();
});

// обработка вызова диалога выбора каталога из контекста браузера -- начало
ipcMain.handle('open-directory-dialog', async (event) => {
    return await dialog.showOpenDialog(win, {
        title: 'Выберите каталог для сохранения результата',
        message: 'Выберите каталог для сохранения результата',
        properties: ['openDirectory'],
    });
});
// обработка вызова диалога выбора каталога из контекста браузера -- конец

// обработка вызова диалога подтверждения -- начало
ipcMain.handle('open-confirm-dialog', async (event, data) => {
    return (await dialog.showMessageBox(win, {
        type: 'question',
        icon: path.join(__dirname, "icon.png"),
        buttons: ['OK', 'Отмена'],
        title: data.title,
        message: data.message
    })).response === 0;
});
// обработка вызова диалога подтверждения -- конец

// получение списка групп -- начало
const GetGroupList = require('../src/helpers/get-group-list');
ipcMain.on('evt-group-list', (event, arg) => {
    new GetGroupList('evt-group-list', event, arg);
});
// получение списка групп -- конец

// получение выгрузки для бухгалтерии -- начало
const GetAnketsExport = require('../src/helpers/get-ankets-export');
ipcMain.on('evt-buh-export', (event, arg) => {
    new GetAnketsExport('evt-buh-export', event, arg);
});
// получение выгрузки для бухгалтерии -- конец

// получение выгрузки для бухгалтерии -- начало
const Config = require('../src/helpers/config');
ipcMain.on('evt-config-set', (event, arg) => {
    new Config('evt-config-set', event, arg);
});
// получение выгрузки для бухгалтерии -- конец

