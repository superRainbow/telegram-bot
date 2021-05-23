const { Telegraf } = require('telegraf');
const moment = require('moment');
const { TIME } = require('./const');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const init = () => {
    const isWorkingDay = true;
    const isWorkingDay = moment().isoWeekday() < 6;
    if (isWorkingDay) {
        checkTime();
    }
}

const checkTime = () => {
    const now = moment(); 
    Object.keys(TIME).map(time => {
        const booking = time.split(':')
        if (parseInt(booking[0], 10) === now.hour() && (parseInt(booking[1], 10) - now.minute() < 5 && parseInt(booking[1], 10) - now.minute() > 0)) {
            bot.telegram.sendMessage( process.env.TELEGRAM_MY_ID, TIME[time]);
        }
    });

}

init();