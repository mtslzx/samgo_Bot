let now_date = new Date();
let offset = +9;
var utc = now_date.getTime() + (now_date.getTimezoneOffset() * 60000);
var nd = new Date(utc + (3600000 * offset));
var a = nd.getHours();


//오늘 날짜를 가져옵니다.
console.log('[시작] 오늘의 급식'); //debug
var json; // json 윗쪽에 변수 선언
let today = new Date();
let year = today.getFullYear(); // 년도
let month = today.getMonth() + 1;  // 월
let date = today.getDate();  // 날짜
let today_lunch, today_dinner;
let timezone = today.getTimezoneOffset();

console.log('함수값 출력 시작');
console.log(today);
console.log(year);
console.log(month);
console.log(date);
console.log('티스토리 함수값 출력 시작');
console.log(now_date);
console.log(offset);
console.log(utc);
console.log(nd);
console.log('테스트용 함수값 출력 시작');
console.log(a);
console.log(timezone);