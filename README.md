# PVE Client

Графическая обёртка над remote-viewer (из набора программ virt-viewer) для подключения к виртуальным машинам Proxmox VE.

Умеет хранить в конфигурационном файле список PVE серверов, из которых предоставляет пользователю возможность выбрать конкретный, ввести логин и пароль, затем показывает список доступных пользователю виртуальных машин на выбранном сервере.

После выбора виртуальной машины происходит загрузка конфигурационного файла proxy.vv с выбранного PVE-сервера и запуск посредством remote-viewer подключения к виртуальной машине по протоколу SPICE. 

# Как?

## Вариант 1: Мне просто пользоваться

### Шаг 1

Скачайте rpm или deb пакет по ссылке: https://disk.yandex.ru/d/10ruEcFjiVLWPA
и установите.

### Шаг 2

Запустите приложение командой:

```
pveclient
```
и пользуйтесь, если Proxmox VE установлен на том же хосте, на котором запустился pveclient.

### Шаг 3

Если необходимо добавить в конфигурационный файл дополнительные серверы PVE, то это можно сделать,
отредактировав список серверов в конфигурационном файле:
```
<домашний каталог пользователя>/.config/pveclient/pveclient.conf
```
После редактирования этого файла приложение pveclient необходимо перезапустить.

### Шаг 4

Если необходимо автоматически обновлять конфигурационный файл 
(pveclient будет проверять его на веб-сервере самостоятельно),
нужно задать в поле update-url конфигурационного файла полный URL до файла на веб-сервере
(например, 
```
"update-url":"http://192.168.1.1/pveclient.config.json")
```
).

Содержимое файла на сервере должно быть аналогично конфигурационному файлу (см. шаг 3).

Если поле:
```
"update-url:""
```
конфигурационного файла заполнено, файл доступен и структура файла соответствует
структуре, ожидаемой приложением (и при этом набор серверов в списке отличается), 
то конфигурационный файл будет обновлён при новом запуске приложения.

## Вариант 2: Мне нужно собрать самостоятельно

### Окружение

Для самостоятельной сборки нужно, чтобы на компьтере были установлены:

1. Платформа NodeJS
2. Angular CLI
3. Electron

### Подготовка

```
npm install
```

### Старт

```
npm start
```

### Пакетирование

```
npm run make-linux
# смотрите директорию dir после завершения
```
