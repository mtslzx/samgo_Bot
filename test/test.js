const request = require('request');

//오늘 날짜를 가져옵니다.
let today = new Date();
let year = today.getFullYear(); // 년도
let month = today.getMonth() + 1;  // 월
let date = today.getDate();  // 날짜
var json = '아직 정의되지 않았습니다!'
//급식정보 API 불러오기
const url = `https://schoolmenukr.ml/api/high/S100000591?date=${date}`
//const url = `https://schoolmenukr.ml/api/high/S100000591?year=${year}&month=${month}`
console.log(url)

request(url, (err, res, body) => {
    json = JSON.parse(body);
    today_meal = json["menu"][0]['dinner'];
    //console.log(json["menu"]);
    console.log(today_meal);
    //Document.write(json.date+"<br>");
    //for(var i = 0 ; i <json['menu'].length; i++){
    //    console.log(json['menu'][i].name + " / " + json['menu'][i].height+"<br>");
   //}
   console.log('중간단계')
    /* for(var i=0;i<json["menu"].length;i++){ //배열 출력
        console.log(i);
        console.log(json["menu"][i]+"<br>");
    } */
    console.log('프로그램 종료');
});