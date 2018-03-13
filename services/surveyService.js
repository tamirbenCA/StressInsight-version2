import storageService from './storageService.js';

const DATA_KEY = 'astresso';
const AUTH_KEY = 'astresso-auth';
const PROMO_TIMER_KEY = 'astresso-promo-timer'
const TASK_TIMER_KEY = 'astresso-task-timer'
const AUTH_WORD = 'aavviivviitt'


var gUsersAnss = [];
var gPromoTimer = null;
var gTaskTimer = null;

var gCurrUser = null;
var gPromo = null;
var gCoinsTask = null;
var gMatchTask = null;

function initExp () {
    getAuth();
    _initTimer();
    var dataFromStorage = getDataFromStorage();
    if (dataFromStorage) {
        gUsersAnss = dataFromStorage;
    }
    // console.log('gUsersAnss:', gUsersAnss);
}

function _initTimer() {
    var promoTimerFromStorage = storageService.loadFromStorage(PROMO_TIMER_KEY);
    var taskTimerFromStorage = storageService.loadFromStorage(TASK_TIMER_KEY);
    if (promoTimerFromStorage) {
        gPromoTimer = promoTimerFromStorage;
    } else {
        setPromoTimer();
    }
    if (taskTimerFromStorage) {
        gTaskTimer = taskTimerFromStorage;
    } else {
        setTaskTimer();
    }

}

function getDataFromStorage() {
    return storageService.loadFromStorage(DATA_KEY);
}

function setPromoTimer() {
    var timer = +prompt('אנא קבע/י טיימר בדקות עבור שלב החיסור');
    storageService.saveToStorage(PROMO_TIMER_KEY, timer);
    gPromoTimer = timer;
}

function setTaskTimer() {
    var timer = +prompt('אנא קבע/י טיימר בדקות עבור החידות');
    storageService.saveToStorage(TASK_TIMER_KEY, timer);
    gTaskTimer = timer;
}

function getAuth() {
    var authFromStorage = storageService.loadFromStorage(AUTH_KEY);
    if (authFromStorage === AUTH_WORD) {
        return;
    } else {
        var authWord;
        while (authWord !== AUTH_WORD) {
            authWord = prompt('אנא הכנס/י מילת זיהוי');
        }
        if (authWord === AUTH_WORD) {
            storageService.saveToStorage(AUTH_KEY, authWord);
            return;
        }
    }
}

function saveSubject() {
    var subject = {...gCurrUser, ...gPromo, ...gCoinsTask, ...gMatchTask}
    gUsersAnss.push(subject);
    // console.log('gUsersAnss:', gUsersAnss);
    storageService.saveToStorage(DATA_KEY, gUsersAnss);
}

function setUser(userInfo) {
    var user = {
        expTime: new Date().toLocaleString('en-GB'),
        id: _getId(),
        name: userInfo.name,
        yob: userInfo.yob,
        gender: userInfo.gender,
        shouldStress: _shouldStress(),
    }
    gCurrUser = user;
    // console.log('currUser:', gCurrUser)
}

function isCurrUserStress() {
    return gCurrUser.shouldStress;
}

function isCurrUser() {
    return !!gCurrUser
}

function setPromo(promoRes) {
    var promo = {
        promoErrorCount: promoRes.errorCount,
        promoStartTime: new Date(promoRes.startTime).toLocaleTimeString('en-GB'),
        promoEndTime: new Date(promoRes.endTime).toLocaleTimeString('en-GB')
    }
    gPromo = promo;
    // console.log('promo:', gPromo);
}

function setCoinsTask(taskRes) {
    var coinsTask = {
        // taskTimeToSolution: _millisToMinutesAndSeconds(taskRes.timeToSolution),
        coinsTaskTimeToSolution: taskRes.timeToSolution,
        coinsTaskSolved: taskRes.solved,
        coinsTaskSelfReport: taskRes.selfReport,
        coinsTaskComment: taskRes.comment
    }
    gCoinsTask = coinsTask;
    // console.log('coins task:', gCoinsTask)
}

function setMatchTask(taskRes) {
    var matchTask = {
        // taskTimeToSolution: _millisToMinutesAndSeconds(taskRes.timeToSolution),
        matchTaskTimeToSolution: taskRes.timeToSolution,
        matchTaskSolved: taskRes.solved,
        matchTaskSelfReport: taskRes.selfReport,
        matchTaskComment: taskRes.comment
    }
    gMatchTask = matchTask;
    // console.log('match task:', gMatchTask)
}

function getPromoTimer() {
    return 1000 * 60 * gPromoTimer
}

function getTaskTimer() {
    return 1000 * 60 * gTaskTimer
}

// not in use for now. it can be reactivate in line 100;
function _millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function _getId() {
    return gUsersAnss.length + 1;
}

function _shouldStress() {
    // this code is predictable odd numbers stress and evan numbers non-stress:
    // if (gUsersAnss.length % 2 === 0) return true;
    // else return false;
    
    // this code is mathematical randomm 50:50 chance:
    return Math.random() < 0.5;
}

function clearLocalStorage() {
    storageService.clearStorage(DATA_KEY);
    storageService.clearStorage(AUTH_KEY);
    storageService.clearStorage(PROMO_TIMER_KEY);
    storageService.clearStorage(TASK_TIMER_KEY);
}

function exportToCsv(filename) {
    if (!storageService.loadFromStorage(DATA_KEY)) {
        alert('אין מידע שמור בזיכרון');
        return;
    };
    var rows = _createData(storageService.loadFromStorage(DATA_KEY));
    var BOM = String.fromCharCode(0xFEFF);

    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = BOM + '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function _createData(dataArr) {
    var obj = dataArr[0];
    var title = [];
    var data = [];

    for (let key in obj) {
        title.push(key)
    }
    data.push(title);
    // console.log('title', title);
    
    dataArr.forEach(arr => {
        var line = [];
        for (let key in arr) {
            line.push(arr[key])
        }
        data.push(line);
    })
    return data;
}

export default {
    getAuth,
    getPromoTimer,
    getTaskTimer,
    getDataFromStorage,
    initExp,
    saveSubject,
    setUser,
    isCurrUser,
    isCurrUserStress,
    setPromo,
    setCoinsTask,
    setMatchTask,
    clearLocalStorage,
    exportToCsv,
    setPromoTimer,
    setTaskTimer
}