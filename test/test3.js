request = require('request');
var json = ''; // json 윗쪽에 변수 선언
let today = new Date();
let year = today.getFullYear(); // 년도
let month = today.getMonth() + 1;  // 월
let date = today.getDate();  // 날짜
let today_lunch;
let today_dinner;
//급식정보 API 불러오기
console.log('2-4'); //debug
const url = `https://schoolmenukr.ml/api/high/S100000591?date=${date}`;
console.log(url);
request(url, (err, res, body) => {
    json = JSON.parse(body);
    console.log(json); // 파싱한 json 로그 출력
    today_lunch = json["menu"][0]['lunch']; // 점심 정보 가져오기
    console.log(today_lunch);
    today_dinner = json["menu"][0]['dinner'] // 저녁 정보 가져오기
});

/*
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
     for(var i=0;i<json["menu"][0]['dinner'].length;i++){ //배열 출력
        console.log(i);
        console.log(json["menu"][0]['dinner'][i]+"<br>");
    }
    console.log('프로그램 종료');
});
*/


console.log(json);
console.log('2-5'); //debug
//var today_date = json["menu"][0]['date'] // 급식 표에 적힌 날짜 가져오기 //오류 발생

console.log(today_lunch)
console.log('2-6'); //debug

/*
response = {
    "text": `${month}월 ${date}일의 급식 정보입니다.\n[점심]\n${today_lunch}\n[저녁]\n${today_dinner}`
}

for (var i = 0; i < json["menu"][0]['dinner'].length; i++) { //배열 출력
    console.log(i);
    let response = (json["menu"][0]['dinner'][i] + "<br>");
}
*/
console.log('2-7'); //debug