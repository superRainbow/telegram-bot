const { Telegraf } = require('telegraf');
const fs = require('fs');
const del = require('del');
const mongoose = require('mongoose');
const { TIP, MAIN_TYPE, SUB_TYPE, SYSTEM_TYPE, EXCEL_HEADER, REPORT_PATH, HELP_MESSAGE } = require('./const');
const { formateToExcel, resetData, checkData, reviewData, bugMainMenu, selectSystem, selectMainQuestion, selectSubQuestion, newExcel, downloadFile } = require('./helper');
require('dotenv').config();

let data = {};

/* ====== monogo DB ======= */
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', err => console.error('connection error', err));
db.once('open', db => console.log('Connected to MongoDB'));
const ibmbSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    system: {
        type: String,
        required: true
    },
    phoneType: {
        type: String,
    },
    systemDes: {
        type: String,
    },
    appVersion: {
        type: String,
    },
    mainQuestion: {
        type: String,
        required: true
    },
    subQuestion: {
        type: String,
    },
    questionDes: {
        type: String,
        required: true
    },
    photo: {
        type: Array
    },
    video: {
        type: Array
    },
    document: {
        type: Array
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
ibmbSchema.methods.info = function () {
    console.log(`Tester ${this.name} done.`);
}
const ibmbData = mongoose.model('ibmb', ibmbSchema);

/** ======== bot ========= */
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
// middleware，所有都會跑這件事
bot.use(Telegraf.log());
bot.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log('Response time: %sms', ms);
});
bot.command('help' , ctx => {
    ctx.reply(`Hello ${ctx.chat.first_name}`);
    ctx.reply(HELP_MESSAGE);
});
bot.command('bug', ctx => {
    bugMainMenu(ctx);
});
bot.command('restart', ctx => {
    data[ctx.chat.id] = resetData();
    bugMainMenu(ctx);
});
bot.command('review', ctx => {
    if (data[ctx.chat.id]) {
        reviewData(data[ctx.chat.id], ctx);
    } else {
        ctx.reply(TIP.REVIEW_ERROR);
    }
});
bot.command('save', ctx => {
    if (data[ctx.chat.id]) {
        if (!checkData(data[ctx.chat.id])) {
            ctx.reply(TIP.DATA_NOT_COMPLETED);
            return;
        }
        saveData(ctx);
    } else {
        ctx.reply(TIP.SAVE_ERROR);
    }
});
bot.command('export', ctx => {
    exportData(ctx);
});
bot.on('text', (ctx) => {
    console.log('text', ctx.update.message.text);
    if (ctx.update.message.reply_to_message) {
        switch (ctx.update.message.reply_to_message.text) {
            case TIP.PHONE_TYPE:
                data[ctx.chat.id].phoneType = ctx.update.message.text;
                ctx.reply(TIP.SYSTEM_DES);
                break;
            case TIP.SYSTEM_DES:
                data[ctx.chat.id].systemDes = ctx.update.message.text;
                ctx.reply(TIP.QUESTION_DES);
                break;
            case TIP.QUESTION_DES:
                data[ctx.chat.id].questionDes = ctx.update.message.text;
                ctx.reply(TIP.MEDIA);
                break;
            default:
                break;
        }
    }
});
bot.on(['photo', 'video'], (ctx) => {
    const type = ctx.update.message.photo ? 'photo' : 'video';
    if (data[ctx.chat.id]) {
        data[ctx.chat.id][type].push(type === 'photo' ? ctx.update.message.photo[1].file_id : ctx.update.message.video.file_id);
    }
});
bot.on('document', (ctx) => {
    if (data[ctx.chat.id]) {
        data[ctx.chat.id].document.push(ctx.update.message.document.file_id);
    }
});

bot.action('bugMainMenu', ctx => {
    ctx.deleteMessage();
    bugMainMenu(ctx);
});
Object.keys(MAIN_TYPE).map(item => bot.action(item, ctx => data = selectMainQuestion(data, ctx)));
Object.keys(SUB_TYPE).map(item => {
    SUB_TYPE[item].map((i, index) => bot.action(`${item}_${index}`, ctx => data = selectSubQuestion(data, ctx)))
});
Object.keys(SYSTEM_TYPE).map(item => bot.action(item, ctx => data = selectSystem(data, ctx)));

bot.launch();


/** ======== fn ========= */
function saveData (ctx) {
    const ibmb = new ibmbData({...data[ctx.chat.id]});
    ibmb.save(function (err, docs) {
        if (err) { return console.error('err', err) };
        ibmbData.find({}, async function (err, all) {
            data[ctx.chat.id].photo.map(item => downloadFile(ctx, item, all.length));
            data[ctx.chat.id].video.map(item => downloadFile(ctx, item, all.length));
            data[ctx.chat.id].document.map(item => downloadFile(ctx, item, all.length));
            docs.info();
            ctx.reply(TIP.SAVE_COMPLETED);
            delete data[ctx.chat.id];
        });
    });
}

function exportData (ctx) {
    ibmbData.find({}, async function (err, data) {
        if (err) { return console.error(err) };
        let workbook = newExcel([ EXCEL_HEADER, ...formateToExcel(data) ]);
        await del([REPORT_PATH]);
        if (!fs.existsSync(REPORT_PATH)){
            fs.mkdirSync(REPORT_PATH);
        }
        await workbook.xlsx.writeFile(`${REPORT_PATH}/bug.xlsx`);
        await ctx.replyWithDocument({ source: fs.createReadStream(`${REPORT_PATH}/bug.xlsx`) , filename: 'bug.xlsx' });
    });
}
