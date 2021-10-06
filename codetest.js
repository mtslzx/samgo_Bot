let now_date = new Date(); //wingnim.tistory.com/6
let offset = +9; // Heroku 서버 위치에 따른 시간대 맞춤
var utc = now_date.getTime() + (now_date.getTimezoneOffset() * 60000);
var nd = new Date(utc + (3600000 * offset));
let weeknum = nd.getDay()
console.log(weeknum)
weeknum = weeknum
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];  // https://mizzo-dev.tistory.com/entry/JavaScript%EB%82%A0%EC%A7%9C-Date-%ED%99%9C%EC%9A%A9%ED%95%B4%EC%84%9C-%EC%9A%94%EC%9D%BC-%EA%B5%AC%ED%95%98%EA%B8%B0
let week = WEEKDAY[weeknum];  // 요일 찾기
console.log(week);

for (var i = 0 ; i < 5 ; i++) {
    if (weeknum >= 7) {  // WEEKDAY array out of bound exception
        console.log('[Exception] "WEEKDAY" Out of Bound');
        weeknum = 1;
        console.log(`[Exception] weeknum : ${weeknum}`);
    }
    console.log(weeknum);
    weeknum++;
}




