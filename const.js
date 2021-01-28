const EXCEL_HEADER = [ '序號', '是否保留', 'id', '時間', '回報人', '作業系統', '手機型號','系統版本', 'APP 版本', '問題主項','問題次項', '問題描述','圖片', '影片', '檔案'];
const COLUMN_ARRAY = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'O'];
const COLUMN_STYLE_MAX = 17;

const MAIN_TYPE = {
    openAccount: '開戶',
    additionalDocument: '開戶補件',
    BreakOff: '開戶中斷',
    edd: 'EDD',
    login: '登入',
    my: '我的',
    setting: '我的設定',
    customerService: '客服',
    push: '通知',
    activeAccount: '活用帳號',
    transfer: '轉帳',
    pocket: '口袋理財',
    loan: '貸款',
    card: '卡片',
    ux: '體驗建議',
};

const SUB_TYPE = {
    openAccount: [
        '開戶條款',
        '輸入手機號碼',
        '手機OTP',
        'MGM邀請碼',
        '自選帳號',
        '輸入身份證字號',
        '開戶目的',
        '工作資訊',
        '銀行帳號驗證',
        'OCR證件掃描',
        '身分證資料驗證',
        '稅籍資料',
        '設定通訊地址',
        '選擇卡面',
        '設定使用者名稱及密碼',
        '裝置綁定',
        '作服審查',
    ],
    additionalDocument: [],
    BreakOff: [],
    edd: [],
    login: [
        '使用者名稱及密碼檢核',
        '第一次登入email綁定',
        '第一次登入手機綁定',
        '忘記代號密碼',
        '設定快速登入',
        '登入後首頁',
        '記住我的使用者代號',
    ],
    my: [
        '帳戶資訊複製',
        '升級',
        'MGM邀請碼',
        '資產總覽',
        '點數',
        '票券夾',
    ],
    setting: [
        '快速登入',
        '通知設定',
        '轉帳設定',
        '通訊地址修改',
        '修改使用者代碼及密碼',
        '牌告利率',
        '常見問題',
        '有話要說',
    ],
    customerService: [],
    push: [],
    activeAccount: [],
    transfer: [
        '自行輸入',
        '約定帳號升級',
        '約定轉帳',
        '收款',
        '分享帳號',
    ],
    pocket: [
        '建立口袋',
        '新增活存口袋',
        '新增定存口袋',
    ],
    loan: [
        '申辦貸款',
        '資料上傳',
        '貸款補件',
    ],
    card: [],
    ux: [],
};

const SYSTEM_TYPE = {
    ios: 'iOS',
    android: 'Android',
    app_both: '手機雙平台',
    web: '作/客服',
};

const VERSION = {
    ios: '0.13.7',
    android: '0.13.7'
};

const HELP_MESSAGE = `
    請輸入要執行的任務：
    /help - 指令參考
    /bug - 問題回報
    /restart - 清除資料
    /review - 預覽資料
    /save - 儲存資料
    /export - 輸出清單
`;

const TIP = {
    CHOICE_MAIN_QUESTION: '請選擇問題主項？',
    CHOICE_SUB_QUESTION: '請選擇問題次項？',
    CHOICE_SYSTEM: '請選擇是作業系統？',
    PHONE_TYPE: '請使用回覆的方式：輸入手機型號',
    SYSTEM_DES: '請使用回覆的方式：輸入手機系統版本',
    QUESTION_DES: '請使用回覆的方式：輸入問題描述',
    MEDIA: '有附件可以上傳圖片/影片/檔案',
    DATA_NOT_COMPLETED: '請檢查使否有必填資料未填寫～',
    SAVE_COMPLETED: '存檔完成～',
    REVIEW_ERROR: '尚未建立資料～請使用 bug 回覆',
    SAVE_ERROR: '尚未建立資料～請使用 bug 回覆',
};

const REPORT_PATH = './output';
const PUBLIC_PATH = './public';

const APP_PORT = 3500;
const SERVER_PORT = 3000;

module.exports = {
    TIP,
    EXCEL_HEADER,
    COLUMN_ARRAY,
    COLUMN_STYLE_MAX,
    MAIN_TYPE,
    SUB_TYPE,
    SYSTEM_TYPE,
    VERSION,
    HELP_MESSAGE,
    PUBLIC_PATH,
    REPORT_PATH,
    APP_PORT,
    SERVER_PORT
};
