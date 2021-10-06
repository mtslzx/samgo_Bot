/*
삼고 급식봇 v2.8 2019-12-18 ~
https://developers.facebook.com/docs/messenger-platform
Facebook Tutorial Guide 참조.
*/

'use strict';
// 아래의 두 값은 알려지면 안됩니다.
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;  // facebook 페이지의 고유한 PAGE ACCESS TOKEN을 환경변수로 입력받습니다.
const PERSONA_ID = process.env.PERSONA_ID;  // facebook 메신저에서 추가된 PERSONA의 고유한 ID를 환경변수로 입력받습니다. https://developers.facebook.com/docs/messenger-platform/send-messages/personas
// Imports dependencies and set up http server
const
    request = require('request'),
    express = require('express'),
    body_parser = require('body-parser'),
    app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('웹훅으로 들어오는 연결 대기중!'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {

    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        body.entry.forEach(function (entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);


            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender ID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {

                handlePostback(sender_psid, webhook_event.postback);
            }

        });
        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});
console.log('[초기화] post 완료!');
// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

    /** UPDATE YOUR VERIFY TOKEN **/
    const VERIFY_TOKEN = "djfuqek";

    // Parse params from the webhook verification request
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Check if a token and mode were sent
    if (mode && token) {

        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Respond with 200 OK and challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});
console.log('[초기화] get 완료!');

function handleMessage(sender_psid, received_message) {
    let response;
    console.log('[알림] 메시지 받음');
    // Checks if the message contains text
    if (received_message.text != "오늘의 급식" && received_message.text != "내일의 급식") {
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        console.log('2-2'); //debug
        response = {
            "text": `"${received_message.text}"라고 하셨나요? 아직 저는 '오늘의 급식'과 '내일의 급식'만 이해 할 수 있어요!\n(띄워쓰기 포함)`,

        };
        callSendAPI(sender_psid, response);
    } else if (received_message.text == "오늘의 급식") {  // 오늘의 급식 기능
        //오늘 날짜를 가져옵니다.
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
            callSendAPI(sender_psid, response);
            console.log('[알림] 메시지 전송');
        });
        console.log('[종료] 오늘의 급식'); //debug
        //var today_date = json["menu"][0]['date'] // 급식 표에 적힌 날짜 가져오기 //오류 발생

        //console.log(today_lunch)
        //console.log('2-6'); //debug

        /*
        for (var i = 0; i < json["menu"][0]['dinner'].length; i++) { //배열 출력
            console.log(i);
            let response = (json["menu"][0]['dinner'][i] + "<br>");
        } */
        //console.log('2-7'); //debug
    } else if (received_message.text == "내일의 급식") {  // 내일의 급식 기능
        //오늘 날짜를 가져옵니다.
        console.log('[시작] 내일의 급식'); //debug
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
            callSendAPI(sender_psid, response);
            console.log('[알림] 메시지 전송');
        });
        console.log('[종료] 내일의 급식'); //debug
    }
    /*
    else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "?",
                        //"subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
    }

    // Send the response message
    callSendAPI(sender_psid, response);

이미지 인식 deprecated
급식 사진 올리기 및 평가 등 관련 기능 추가시 사용예정
     */
    console.log('[초기화] handleMessage 완료!');
}

function handlePostback(sender_psid, received_postback) {
    console.log('ok')
    let response;
    // Get the payload for the postback
    let payload = received_postback.payload;
    // 오늘의 날짜를 가져옵니다.
    let today = new Date();


    // Set the response based on the postback payload
    if (payload === 'yes' || payload === 'no') {  // 이미지 답장 deprecated
        response = {"text": ""}
    } else if (payload == 'FACEBOOK_WELCOME') {  // 메신저 최초 접속 시
        response = {"text": '안녕하세요!'}
        callSendAPI(sender_psid, response);
        setTimeout(function () {  // 현실감을 위해 딜레이 추가
            response = {"text": '저는 삼천포고등학교 급식봇입니다!'}
            callSendAPI(sender_psid, response);
        }, 200);
        setTimeout(function () {
            response = {"text": '쉽고 빠르게 오늘의 급식을 알려드리도록 하겠습니다.'}
            callSendAPI(sender_psid, response);
        }, 500);
        setTimeout(function () {
            response = {"text": '시작하려면 오른쪽 아래의 ☰ 버튼을 누르거나 "오늘의 급식" 혹은 "내일의 급식"을 보내주세요.'}
            callSendAPI(sender_psid, response);
        }, 1000);
        console.log('[알림] Welcome 메시지 전송');
    } else if (payload == "week") {
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
                            callSendAPI(sender_psid, responssse);
                            console.log('[예외] 전송')
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
                callSendAPI(sender_psid, responssse);
                console.log(`${startday}일 확인`);
                weeknum++;  // 요일 증가. 초기값 1. 월~금까지.
                startday++;  // 월요일 startday 날짜 증가. 월 -> 금까지.
            }
            if (exception1 == true) {
                console.log(responssse)
                // callSendAPI(sender_psid, responssse);
                console.log(`[예외] 종료`);
            } else if (exception1 == false) {
                console.log(responssse)
                callSendAPI(sender_psid, responssse);
                console.log(`[정상] 종료`);
            }
        });
        console.log('debug A')
        //callSendAPI(sender_psid, response);
        //console.log('[알림] Week 메시지 전송');
    } else if (payload == "today") {  // 오늘의 급식 고정 메뉴 호출 시
        //오늘 날짜를 가져옵니다.
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
            callSendAPI(sender_psid, response);
            console.log('[알림] 메시지 전송');
        });
        console.log('[종료] 오늘의 급식'); //debug
    } else if (payload == "tomorrow") {  // 내일의 급식 고정 메뉴 호출 시
        //오늘 날짜를 가져옵니다.
        console.log('[시작] 내일의 급식'); //debug
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
            callSendAPI(sender_psid, response);
            console.log('[알림] 메시지 전송');
        });
        console.log('[종료] 내일의 급식'); //debug
    }
    // Send the message to acknowledge the postback
    /*
    callSendAPI(sender_psid, response);
    console.log('[알림] handlePostback 메시지 전송');
     */
}
/*
코드 실행 순서가 어떻게 되는건지 모르겠다
원래 callSendAPI가 마지막에서 보내주는거였는데
저 코드 넣은뒤로는 뭔가 꼬인듯함. 그래서 if 케이스마다 callSendAPI 추가함.
 */
console.log('[초기화] handlePostback 완료!');



function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('[callSendAPI] 전송완료!')
        } else {
            console.error("[callSendAPI] 에러:" + err);
        }
    });
}

function callSendAPIPersona(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient":{
            "id": sender_psid
        },
        "message":{
            "text": response,
        },
        "persona_id": PERSONA_ID
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('[callSendAPIPersona] 전송완료!')
        } else {
            console.error("[callSendAPIPersona] 에러:" + err);
        }
    });
}
console.log('[초기화] callSendAPI & callSendAPIP');
console.log('[초기화] 완료!');


