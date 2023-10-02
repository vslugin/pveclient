module.exports = class GetAnketsExport {
    event = null;
    channel = null
    btnSelector = null;
    logSelector = null;
    res = [];

    constructor(channel, event, arg) {
        this.channel = channel;
        this.event = event;
        this.btnSelector = arg.btnSelector;
        this.logSelector = arg.logSelector;

        // lock button message
        this.lockMessage();

        // simple code code
        this.reply('STARTED');
        let n = 1;
        const ip = setInterval(() => {
            this.reply(`log ankets export msg ${n} ...`);
            n++;
        }, 1000);

        setTimeout(() => {
            clearInterval(ip);
            this.reply('FINISHED');
            this.unlockMessage();
        }, 5000);
    }

    reply(msg) {
        this.event.reply(this.channel, this.appendLog(msg));
    }

    appendLog(msg) {
        this.res.push(msg);
        return {action: 'log', logSelector: this.logSelector, logData: this.res.join('\n')};
    }

    lockMessage() {
        this.event.reply(this.channel, {action: 'lock', btnSelector: this.btnSelector});
    }

    unlockMessage() {
        this.event.reply(this.channel, {action: 'unlock', btnSelector: this.btnSelector});
    }
}
