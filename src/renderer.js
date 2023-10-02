// пример вытаскивания версии ноды из контекста nodejs в браузер
/*const information = document.getElementById('info')
information.innerText = `This app is using nodejs v${window.pveclient.node()})`;*/

// все кнопки с классом helper-btn для обработки клика по ним...
const helperBtns = document.querySelectorAll('.helper-btn');

// прослушиваем клик на каждой кнопке
helperBtns.forEach(btn => {
    btn.addEventListener('click', event => {
        // достаём id нажатой кнопки
        const btnSelector = `#${event.target.getAttribute('id')}`;
        // достаём из аттрибута log-selector селектор для поля вывода логов
        const logSelector = '#' + event.target.getAttribute('log-selector');

        // если есть условая по btnSelector, то выполняем логику
        switch (btnSelector) {
            case '#btn-helper-1':
                // открываем диалог выбора директории для сохранения результата
                window.pveclient.openDialogDirectorySelection(result => {
                    if (!result.canceled) {
                        const destinationDir = result.filePaths[0];
                        // подтверждаем намеряние сохранить результат в выбранную директорию
                        window.pveclient.openDialogConfirm(
                            'Подтверждение',
                            `Действительно сохранить результат в каталог: ${destinationDir}?`,
                            isConformed => {
                                if (isConformed) {
                                    // если подтверждено -- то запускаем процесс
                                    window.pveclient.emitEvent('evt-group-list', {
                                        btnSelector,
                                        logSelector,
                                        destinationDir
                                    });
                                }
                            }
                        );
                    }
                });
                break;
            case '#btn-helper-2':
                window.pveclient.emitEvent('evt-buh-export', {btnSelector, logSelector});
                break;
            default: // иначе отвечаем, что неизвестная кнопка была нажата и выводим её id
                console.log('button with unknown id pressed:', btnSelector);
        }
    });
});

// обновляем параметры подключения из конфига в поля ввода
window.pveclient.emitEvent('evt-config-set', {});

// все поля ввода данных подключения к серверу...
const configInputs = document.querySelectorAll('.config-input');

// прослушиваем клик на каждой кнопке
configInputs.forEach(inp => {

    function onInputChanged(id) {
        window.pveclient.emitEvent('evt-config-set', {inpSelector: id, inpValue: document.querySelector(id).value});
    }

    inp.addEventListener('input', event => {
        // достаём id нажатого инпута
        const inpSelector = `#${event.target.getAttribute('id')}`;
        onInputChanged(inpSelector);
    });

});


window.pveclient.handleEvent('evt-group-list', (event, data) => {
    switch (data.action) {
        case 'lock':
            document.querySelector(data.btnSelector).setAttribute('disabled', 'true');
            break;
        case 'unlock':
            document.querySelector(data.btnSelector).removeAttribute('disabled');
            break;
        case 'log':
            document.querySelector(data.logSelector).innerHTML = data.logData;
            break;
    }
});

window.pveclient.handleEvent('evt-buh-export', (event, data) => {
    switch (data.action) {
        case 'lock':
            document.querySelector(data.btnSelector).setAttribute('disabled', 'true');
            break;
        case 'unlock':
            document.querySelector(data.btnSelector).removeAttribute('disabled');
            break;
        case 'log':
            document.querySelector(data.logSelector).innerHTML = data.logData;
            break;
    }
});

window.pveclient.handleEvent('evt-config-set', (event, data) => {
    // console.log('reply for evt-config-set', data);
    switch (data.action) {
        case 'new-config':
            document.querySelector('#server-url').value = data.config.serverUrl;
            document.querySelector('#server-login').value = data.config.serverLogin;
            document.querySelector('#server-password').value = data.config.serverPassword;
            break;
    }
});
