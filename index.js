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
        const subtract = (parseInt(booking[0], 10) * 60 + parseInt(booking[1], 10)) - (now.hour() * 60 + now.minute());
        console.log('subtract', subtract);
        // 判斷是否是 10 分鐘內即將到達的會議 (將時間換算成分鐘相減)
        if ( subtract > 0 && subtract <= 10) {
            bot.telegram.sendMessage( process.env.TELEGRAM_TEAM_ID, TIME[time]);
        }
    });
}

init();