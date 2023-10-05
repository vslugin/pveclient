const {app, BrowserWindow, Menu, ipcMain, dialog} = require('electron');
const path = require('path');
const url = require("url");

const debugEnabled = false;
const showMenu = false;
const showFrame = false;
const maximize = true;

let win;

const createWindow = () => {
    win = new BrowserWindow({
        frame: showFrame,
        width: 1800,
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

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, '..', 'angular_src/dist/angular_src/index.html'),
            protocol: "file:",
            slashes: true
        })
    );

    win.on('close', (event) => {

        // Отменяем стандартное действие закрытия приложения
        event.preventDefault();

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

const SpiceClientRunner = require('../src/helpers/spice-client-runner');
const Config = require('../src/helpers/config');

let CFG;
let SCR;

// конфиг
ipcMain.on('evt-config-set', (event, arg) => {
    SCR = new SpiceClientRunner('evt-init', event, arg);
    CFG = new Config('evt-config-set', event, arg);
});

// логин и получение списка виртуальных машин
ipcMain.on('evt-get-virtual-machines', (event, arg) => {
    SCR.getVirtualMachines('evt-get-virtual-machines', event, arg);
});

// запуск spice клиента
ipcMain.on('evt-run-virt-viewer', (event, arg) => {
    SCR.runVirtViewer('evt-run-virt-viewer', event, arg);
});

// отправка выбранного сервера
ipcMain.on('evt-set-selected-server', (event, arg) => {
    SCR.setSelectedServer('evt-set-selected-server', event, arg);
});

// попытка закрытия из клиента
ipcMain.on('evt-close-attempt', (event, arg) => {
    app.quit();
});