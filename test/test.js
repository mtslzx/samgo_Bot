const request = require('request');
//오늘 날짜를 가져옵니다.
let today = new Date();
let year = today.getFullYear(); // 년도
let month = today.getMonth() + 1;  // 월
let date = today.getDate();  // 날짜
//급식정보 API 불러오기
const url = `https://schoolmenukr.ml/api/high/S100000591?date=${date}`;
request(url, (err, res, body) => {
    var json = JSON.parse(body);
    console.log(json);
});