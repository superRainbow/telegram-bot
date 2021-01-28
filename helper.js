const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ExcelJS = require ('exceljs');
const { TIP, PUBLIC_PATH, MAIN_TYPE, SUB_TYPE, SYSTEM_TYPE, VERSION } = require('./const');

function checkData (data) {
    const { name, system, phoneType, systemDes, mainQuestion, questionDes } = data;
    return system !== SYSTEM_TYPE.web ? name && system && phoneType && systemDes && mainQuestion && questionDes : name && system && mainQuestion && questionDes;
}

function resetData () {
    return {
        uid: '',
        name: '',
        system: '',
        phoneType: '',
        systemDes: '',
        appVersion: '',
        mainQuestion: '',
        subQuestion: '',
        questionDes: '',
        photo: [],
        video: [],
        document: []
    };
}

function reviewData (data, ctx) {
    ctx.telegram.sendMessage(ctx.chat.id, `
        <b>預覽資料：</b>
        <b>回報人：${data.name}</b>
        <b>作業系統：${data.system}</b>
        <b>手機型號：${data.phoneType}</b>
        <b>系統版本：${data.systemDes}</b>
        <b>APP版本：${data.appVersion}</b>
        <b>問題主項：${data.mainQuestion}</b>
        <b>問題次項：${data.subQuestion}</b>
        <b>問題描述：${data.questionDes}</b>
    `, {
        parse_mode: 'HTML'
    });
}

function getFileType ( url ) {
    return url.split(/[#?]/)[0].split('.').pop().trim();
}

function getSystemItems () {
    return Object.keys(SYSTEM_TYPE).map(item => {
        return [{ text: SYSTEM_TYPE[item], callback_data: item }]
    });
}

function getMainQuestionItems () {
    return Object.keys(MAIN_TYPE).map(item => {
        return [{ text: MAIN_TYPE[item], callback_data: item }]
    });
}

const bugMainMenu = (ctx) => {
    sendMessage(ctx, TIP.CHOICE_MAIN_QUESTION, getMainQuestionItems());
};

function getSubQuestionItems (key) {
    return SUB_TYPE[key].map((item, index) => {
        return [{ text: item, callback_data: `${key}_${index}` }]
    });
}

function getSubQuestionName (string) {
    const array = string.split('_');
    return SUB_TYPE[array[0]][array[1]];
}

function selectSystem (data, ctx) {
    const system = SYSTEM_TYPE[ctx.update.callback_query.data];
    data[ctx.chat.id].system = system;
    data[ctx.chat.id].appVersion = system !== SYSTEM_TYPE.web ? VERSION[ctx.update.callback_query.data] : '';
    ctx.reply(system !== SYSTEM_TYPE.web ? TIP.PHONE_TYPE : TIP.QUESTION_DES);
    return data;
}

function selectMainQuestion (data, ctx) {
    data[ctx.chat.id] = resetData();
    data[ctx.chat.id].uid = ctx.chat.id;
    data[ctx.chat.id].name = ctx.chat.last_name ? `${ctx.chat.first_name} ${ctx.chat.last_name}`: `${ctx.chat.first_name}`;
    data[ctx.chat.id].mainQuestion = MAIN_TYPE[ctx.update.callback_query.data];

    const hasSub = SUB_TYPE[ctx.update.callback_query.data].length > 0;
    const tip = hasSub ? `[${data[ctx.chat.id].mainQuestion}] ${TIP.CHOICE_SUB_QUESTION}` : TIP.CHOICE_SYSTEM;
    const keyboardData = hasSub ? getSubQuestionItems(ctx.update.callback_query.data) : getSystemItems();
    sendMessage(ctx, tip, keyboardData);
    return data;
}

function selectSubQuestion (data, ctx) {
    if (data[ctx.chat.id]) {
        data[ctx.chat.id].subQuestion = getSubQuestionName(ctx.update.callback_query.data);
        sendMessage(ctx, TIP.CHOICE_SYSTEM, getSystemItems());
        return data;
    }
}

function sendMessage (ctx, tip, keyboardData) {
    ctx.telegram.sendMessage(ctx.chat.id, tip, {
        reply_markup: {
            inline_keyboard: [ ...keyboardData]
        }
    });
}

function formateToExcel (data) {
    let formateData = [];
    data.map((item, index) => formateData.push([ `${index + 1 }`, '', item._id.toString(), item.createdAt, item.name, item.system, item.phoneType, item.systemDes, item.appVersion, item.mainQuestion, item.subQuestion, item.questionDes, item.photo, item.video, item.document ]))
    return formateData;
}

function getColumnWidth () {
    return [ 10, 5, 10, 20, 20, 20, 20, 20, 20, 20, 20, 50, 60, 60, 60 ];
}

function getCellStyle (rowIndex) {
    switch (rowIndex) {
        case 1:
            return {
                height: 20,
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF900' }
                },
                font: {
                    name: 'Calibri',
                    size: 16,
                    bold: true,
                    color: { argb: '000000' }
                },
                alignment: {
                    vertical: 'middle',
                    horizontal: 'left',
                }
            };
        default:
            return {
                height: 20,
                font: {
                    name: 'Calibri',
                    size: 12,
                    bold: false,
                    color: { argb: '000000' }
                },
                alignment: {
                    vertical: 'middle',
                    horizontal: 'left'
                },
            };
    }

}

function setExcelStyle (sheet) {
    sheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
        const cellLength = row.actualCellCount;
        row.eachCell(() => {
            for (var i = 1; i <= cellLength; i++) {
                row.height = getCellStyle(rowIndex, i).height;
                row.getCell(i).fill = getCellStyle(rowIndex, i).fill;
                row.getCell(i).style.font = getCellStyle(rowIndex, i).font;
                sheet.getColumn(i).width = getColumnWidth()[i - 1];
            }
        });
    });
    return sheet;
}

function newExcel(data) {
    let workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('回報清單');
    worksheet.addRows(data);
    setExcelStyle(worksheet);
    return workbook;
}

function downloadFile (ctx, fileId, fileName) {
    ctx.telegram.getFileLink(fileId).then(url => {
        axios({url, responseType: 'stream'}).then(response => {
            return new Promise((resolve, reject) => {
                if (!fs.existsSync(`${PUBLIC_PATH}/${fileName}`)){
                    fs.mkdirSync(`${PUBLIC_PATH}/${fileName}`);
                }
                const fileUrl = path.join(__dirname, `${PUBLIC_PATH}/${fileName}`, `${fileId}.${getFileType(url)}`);
                response.data
                            .pipe(fs.createWriteStream(fileUrl))
                            .on('finish', () => console.log('finish'))
                            .on('error', error => console.log('error', error));
            });
        });
    });
}

module.exports = {
    resetData,
    checkData,
    reviewData,
    getFileType,
    getSystemItems,
    getMainQuestionItems,
    getSubQuestionItems,
    getSubQuestionName,
    selectSystem,
    bugMainMenu,
    selectMainQuestion,
    selectSubQuestion,
    newExcel,
    formateToExcel,
    sendMessage,
    downloadFile,
};
