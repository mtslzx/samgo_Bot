const request = require("request");

console.log('[시작] 오늘의 급식'); //debug
var json; // json 윗쪽에 변수 선언
let now_date = new Date(); //wingnim.tistory.com/6
let offset = +9; // Heroku 서버 위치에 따른 시간대 맞춤
var utc = now_date.getTime() + (now_date.getTimezoneOffset() * 60000);
var nd = new Date(utc + (3600000 * offset));
let year = nd.getFullYear(); // 년도
let month = nd.getMonth() + 1;  // 월  여기 +1이 왜 있을까?
let date = nd.getDate(); // 날짜
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];  // https://mizzo-dev.tistory.com/entry/JavaScript%EB%82%A0%EC%A7%9C-Date-%ED%99%9C%EC%9A%A9%ED%95%B4%EC%84%9C-%EC%9A%94%EC%9D%BC-%EA%B5%AC%ED%95%98%EA%B8%B0
let week = WEEKDAY[nd.getDay()];  // 요일 찾기
let samgo_breakfast, samgo_lunch, samgo_dinner;

console.log("[알림] TimeZone 초기화 " + nd);
console.log("[알림] 수정된 날짜: " + year.toString() + "-" + month.toString() + "-" + date.toString())

const url = `https://schoolmenukr.ml/api/high/S100000591?date=${date}&allergy=hidden`;  // https://github.com/5d-jh/school-menu-api
request(url, (err, res, body) => {
    json = JSON.parse(body);
    //console.log(json); // 파싱한 json 로그 출력
    samgo_breakfast = json["menu"][0]['breakfast']; // 아침 정보 가져오기
    samgo_lunch = json["menu"][0]['lunch']; // 점심 정보 가져오기
    samgo_dinner = json["menu"][0]['dinner'] // 저녁 정보 가져오기
    console.log('[로그] 아침 :' + samgo_breakfast);
    console.log('[로그] 점심 :' + samgo_lunch);
    console.log('[로그] 저녁 :' + samgo_dinner);
    if (samgo_breakfast == "" && samgo_lunch == "" && samgo_dinner == "") {  // 예외 추가. - 급식이 없는 날
        response = {
            "text": `${month}월 ${date}일(${week})의 급식 정보가 존재하지 않습니다.`
        }
    } else {
        response = {
            "text": `${month}월 ${date}일(${week})의 급식 정보입니다.\n\n[아침]\n${samgo_breakfast} \n\n[점심]\n${samgo_lunch}\n\n[저녁]\n${samgo_dinner}`
        }
    }
    console.log((response))
    //callSendAPI(sender_psid, response);
    //console.log('[알림] 메시지 전송');
});

/*
const request = require("request");
console.log('[시작] 내일의 급식'); //debug
var json; // json 윗쪽에 변수 선언
let now_date = new Date(); //wingnim.tistory.com/6
let offset = + 9; // Heroku 서버 위치에 따른 시간대 맞춤
var utc = now_date.getTime() + (now_date.getTimezoneOffset() * 60000);
var nd = new Date(utc + (3600000 * offset));
let year = nd.getFullYear(); // 년도
let month = nd.getMonth() + 1;  // 월  여기 +1이 왜 있을까?
let date = nd.getDate() + 0; // 날짜 : 내일의 급식을 위해 1일 추가
console.log("[알림] TimeZone 초기화 " + nd);
console.log("[알림] 수정된 날짜: " + year.toString() + "-" + month.toString() + "-" + date.toString())

//급식정보 API 불러오기
console.log('[함수 선언 완료] 내일의 급식'); //debug
const url = `https://schoolmenukr.ml/api/high/S100000591?date=${date}&allergy=hidden`;  // https://github.com/5d-jh/school-menu-api
request(url, (err, res, body) => {
    json = JSON.parse(body);
    //console.log(json); // 파싱한 json 로그 출력
    samgo_breakfast = json["menu"][0]['breakfast']; // 아침 정보 가져오기
    samgo_lunch = json["menu"][0]['lunch']; // 점심 정보 가져오기
    samgo_dinner = json["menu"][0]['dinner'] // 저녁 정보 가져오기
    console.log('[로그] 아침 :' + samgo_breakfast);
    console.log('[로그] 점심 :' + samgo_lunch);
    console.log('[로그] 저녁 :' + samgo_dinner);
    response = {
        "text": `${month}월 ${date}일의 급식 정보입니다.\n\n[아침]\n${samgo_breakfast} \n\n[점심]\n${samgo_lunch}\n\n[저녁]\n${samgo_dinner}`
    }
    console.log('[알림] 메시지 전송');
});
console.log('[종료] 내일의 급식'); //debug


 */


/*
console.log('[시작] 내일의 급식'); //debug
var json; // json 윗쪽에 변수 선언
let now_date = new Date(); //wingnim.tistory.com/6
let offset = +9; // Heroku 서버 위치에 따른 시간대 맞춤
var utc = now_date.getTime() + (now_date.getTimezoneOffset() * 60000);
var nd = new Date(utc + (3600000 * offset));
let year = nd.getFullYear(); // 년도
let month = nd.getMonth() + 1;  // 월  여기 +1이 왜 있을까?
let date = nd.getDate() + 1; // 날짜 : 내일의 급식을 위해 1일 추가
console.log("[알림] TimeZone 초기화 " + nd);
console.log("[알림] 수정된 날짜: " + year.toString() + "-" + month.toString() + "-" + date.toString())
*/

/*
var sentence = "This is one sentence. This is a sentence with a list of items:cherries, oranges, apples, bananas.";
var msgchk_start = sentence.indexOf("z");
var msgchk_end = sentence.indexOf("x");

var msgchk_list = sentence.substring(msgchk_start, msgchk_end+1);
console.log(msgchk_list);   // cherries, oranges, apples, bananas

console.log("" == msgchk_list) // true
*/


/*
조식기능 추가
내일 급식 시간 수정
TODO 주간 급식 추가
급식 없는날 예외 추가
버튼 추가
TODO 자연어 처리 (대화) 추가? w. https://developers.facebook.com/docs/messenger-platform/send-messages/personas and  firebase

원래 문맥에서 급식이라는 단어와
내일 오늘 이걸 뽑아내려고 했는데
버튼만들면 딱히 필없을듯

 */


