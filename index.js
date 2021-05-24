const { Telegraf } = require('telegraf');
const moment = require('moment-timezone');
const { TIME } = require('./const');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const init = () => {
    const isWorkingDay = moment().isoWeekday() < 6;
    if (isWorkingDay) {
        checkTime();
    }
}

const checkTime = () => {
    const now = moment().tz('Asia/Taipei');
    console.log('log', now, now.hour(), now.minute());
    Object.keys(TIME).map(time => {
        const booking = time.split(':');
        if (parseInt(booking[0], 10) === now.hour() && (parseInt(booking[1], 10) - now.minute() < 10 && parseInt(booking[1], 10) - now.minute() > 0)) {
            bot.telegram.sendMessage( process.env.TELEGRAM_TEAM_ID, TIME[time]);
        }
    });
}

init();