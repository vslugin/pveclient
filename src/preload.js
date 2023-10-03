const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('pveclient', {
    emitEvent: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    handleEvent: (channel, callback) => {
        ipcRenderer.on(channel, callback);
    }
})
