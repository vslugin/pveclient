const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('pveclient', {
    node: () => process.versions.node,
    openDialogDirectorySelection: (callback) => {
        ipcRenderer.invoke('open-directory-dialog').then((result) => {
            callback(result);
        });
    },
    openDialogConfirm: (title, message, callback) => {
        ipcRenderer.invoke('open-confirm-dialog', {title, message}).then((result) => {
            callback(result);
        });
    },
    emitEvent: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    handleEvent: (channel, callback) => {
        ipcRenderer.on(channel, callback);
    }
})
