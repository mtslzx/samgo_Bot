const request = require("request");
let {response} = require("express");

console.log('[시작] 이번주 급식'); // debug
var json; // json 윗쪽에 변수 선언
let now_date = new Date(); // wingnim.tistory.com/6
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
// 이번 주 월요일 구하기
let startday = date;
if (week == '토') {
    startday = date + 2;
    console.log(`보정된 이번 주 월요일 : ${startday}`)
} else if (week == '일') {
    startday = date + 1;
    console.log(`보정된 이번 주 월요일 : ${startday}`)
} else if (week == '월') {
    startday = date + 0;
    console.log(`보정된 이번 주 월요일 : ${startday}`)
} else if (week == '화') {
    startday = date - 1;
    console.log(`보정된 이번 주 월요일 : ${startday}`)
} else if (week == '수') {
    startday = date - 2;
    console.log(`보정된 이번 주 월요일 : ${startday}`)
} else if (week == '목') {
    startday = date - 3;
    console.log(`보정된 이번 주 월요일 : ${startday}`)
} else if (week == '금') {
    startday = date - 4;
    console.log(`보정된 이번 주 월요일 : ${startday}`)
}

console.log("[알림] 이번 주 월요일: " + startday.toString())

let responssse = "";  // 빈 텍스트 생성
let exception1 = false;
const url = `https://schoolmenukr.ml/api/high/S100000591?month=${month}&allergy=hidden`;  // https://github.com/5d-jh/school-menu-api
let weeknum = 1;
request(url, (err, res, body) => {
    json = JSON.parse(body);
    // console.log(json); // 파싱한 json 로그 출력
    const obj = JSON.parse(body);  // https://hianna.tistory.com/457 JSON파싱 자바스크립트 객채화
    for (var i = 0; i < 5 ; i++){  // 월요일부터 5일간의 (월 - 금)을 하나하나 작성함
        //meal = json['menu'][startday - 1]  // Array는 0번째부터 카운트하므로 -1
        week = WEEKDAY[weeknum];  // 요일 선택. 초기값 1 / 월요일부터 시작하도록 고안되었으니 요일은 무조건 월요일 부터 시작함.
        if (typeof obj.menu[startday - 1] == "undefined") {  // https://stackoverflow.com/questions/6728424/array-out-of-bounds-comparison-with-undefined-or-length-check
            console.log('[예외] 다음 달 확인')  // 예외 상황 구별용 예) 월말 30일에 조회할 경우 30 31 32 ... 로 없는 날짜를 조회하게 됨. 그러므로 JSON array에 정의되지 않은 부분을 접근할 경우 확인하기
            // TODO 남은 사이클을 알아내서 startday 를 1로 바꾸고 다음달에 남은 사이클만큼 더 조회하면 될듯
            // TODO 만약 30일날 조회했고 31일이 이달의 마지막날이면 30 31 32 <- 여기서 문제가 생기니 i값을 끌어와서 다음달 1일 부터 시작하면 해결일듯함
            // TODO 같은 for문을 쓰면 될듯
            // TODO 여러개 나누어서 보낼까 한번에 보낼까
            // TODO 12월 같은 경우 오류 가능성 / 물론 12월 31일에 쓸 사람이 있나 싶은데...
            exception1 = true;  // 예외 상황 처리용도로 예외상황알림
            startday = 1;  // 다음달로 넘어가면 1일부터 조회할 것이므로
            const except_url = `https://schoolmenukr.ml/api/high/S100000591?month=${month + 1}&allergy=hidden`;  // 예외로 인한 다음 달 불러오기
            request(except_url, (err, res, body) => {
                const obj_ex = JSON.parse(body);
                for (; i < 5; i++) {
                    week = WEEKDAY[weeknum];  // 요일 선택.
                    let edate = obj_ex.menu[startday - 1].date;  // 다음달 JSON에서 날짜 가져오기
                    let ebrkfst = obj_ex.menu[startday - 1].breakfast;  // 다음달 JSON에서 아침 가져오기
                    let elunch = obj_ex.menu[startday - 1].lunch;  // 다음달 JSON에서 점심 가져오기
                    let ediner = obj_ex.menu[startday - 1].dinner;  // 다음달 JSON에서 저녁 가져오기
                    responssse = responssse + `${month + 1}월 ${edate}일(${week}) 급식입니다.\n[아침] ${ebrkfst}\n[점심] ${elunch}\n[저녁] ${ediner}\n\n`;
                    console.log(`[예외] 응답 : \n${responssse}`);
                }
            });
            console.log("[예외] 완료");
            break;  // 예외상황 벗어나기
        }
        let jdate = obj.menu[startday - 1].date;  // JSON에서 날짜 가져오기
        let jbrkfst = obj.menu[startday - 1].breakfast;  // JSON에서 아침 가져오기
        let jlunch = obj.menu[startday - 1].lunch;  // JSON에서 점심 가져오기
        let jdiner = obj.menu[startday - 1].dinner;  // JSON에서 저녁 가져오기
        responssse = responssse + `${month}월 ${jdate}일(${week}) 급식입니다.\n[아침] ${jbrkfst}\n[점심] ${jlunch}\n[저녁] ${jdiner}\n\n`
        console.log(`${startday}일 확인`);
        weeknum++;  // 요일 증가. 초기값 1. 월~금까지.
        startday++;  // 월요일 startday 날짜 증가. 월 -> 금까지.
    }
    if (exception1 == true) {
        console.log(`[예외] 종료`);
    } else if (exception1 == false) {
        console.log(responssse);
        console.log(`[정상] 종료`);
    }
    //console.log('end');
    //console.log(responssse);
    // 변수에 글자 추가하는 방식으로 모으기 하면될듯.



    /*
    for (var i = 0; i < 5; i++ ) {
        console.log(`날짜 : ${startday}`)
        for(var i = 0; i < 3; i++ ) {
            console.log(json)
            test_breakfast = json['menu'][startday]
            console.log(test_breakfast)
            console.log('check')
        }
        console.log(response)
        console.log(3)
        startday++
    }

     */
    /*
    samgo_breakfast = json["menu"][0]['breakfast']; // 아침 정보 가져오기
    samgo_lunch = json["menu"][0]['lunch']; // 점심 정보 가져오기
    samgo_dinner = json["menu"][0]['dinner'] // 저녁 정보 가져오기
    console.log('[로그] 아침 :' + samgo_breakfast);
    console.log('[로그] 점심 :' + samgo_lunch);
    console.log('[로그] 저녁 :' + samgo_dinner);
     */
    /*
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

     */
});





/*
요일이 키포인트인듯. 현재 날짜 기준 요일로 뽑으면 되지 않을까

json에 없으면 다음달 하면 될듯함
달의 마지막 날을 알아야 할텐데
 */

/*

const url = `https://schoolmenukr.ml/api/high/S100000591?month=${month}&allergy=hidden`;  // https://github.com/5d-jh/school-menu-api
request(url, (err, res, body) => {
    json = JSON.parse(body);
    console.log(json); // 파싱한 json 로그 출력
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


 */
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
TODO 달의 첫/마지막 예외 처리
급식 없는날 예외 추가
버튼 추가
TODO 자연어 처리 (대화) 추가? w. https://developers.facebook.com/docs/messenger-platform/send-messages/personas and  firebase

원래 문맥에서 급식이라는 단어와
내일 오늘 이걸 뽑아내려고 했는데
버튼만들면 딱히 필없을듯

 */


