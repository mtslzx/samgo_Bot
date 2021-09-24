/*
삼고 급식봇 v1.3 2019-12-18 ~
https://developers.facebook.com/docs/messenger-platform
Facebook Tutorial Guide 참조.
*/

'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
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
    if (received_message.text != "오늘의 급식" && received_message.text != "내일의 급식")
    {
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        console.log('2-2'); //debug
        response = {
            "text": `"${received_message.text}"라고 하셨나요? 아직 저는 '오늘의 급식'과 '내일의 급식'만 이해 할 수 있어요!`,
        };
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
        let samgo_breakfast, samgo_lunch, samgo_dinner;
        console.log("[알림] TimeZone 초기화 " + nd);
        console.log("[알림] 수정된 날짜: " + year.toString() + "-" + month.toString() + "-" + date.toString())

        //급식정보 API 불러오기
        console.log('[함수 선언 완료] 오늘의 급식'); //debug
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
        let date = nd.getDate() + 1; // 날짜 : 내일의 급식을 위해 1일 추가
        let samgo_breakfast, samgo_lunch, samgo_dinner;
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
            callSendAPI(sender_psid, response);
            console.log('[알림] 메시지 전송');
        });
        console.log('[종료] 내일의 급식'); //debug
    }
    
    else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "이 사진은 무엇인가요?",
                        //"subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "그냥 가져!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "잘못 올렸어!",
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
}
console.log('[초기화] handleMessage 완료!');

function handlePostback(sender_psid, received_postback) {
    console.log('ok')
    let response;
    // Get the payload for the postback
    let payload = received_postback.payload;
    // 오늘의 날짜를 가져옵니다.
    let today = new Date();


    // Set the response based on the postback payload
    if (payload === 'yes') {  // 이미지 답장 deprecated
        response = {"text": ""}
    } else if (payload === 'no') {  // 이미지 답장 deprecated
        response = {"text": ""}
    } else if (payload == 'FACEBOOK_WELCOME') {  // 메신저 최초 접속 시
        response = {"text": "안녕하세요!\n저는 삼고 급식봇입니다!\n최대한 빠르게 오늘의 급식을 알려드리도록 하겠습니다.\n 시작하려면 '오늘의 급식' 혹은 '내일의 급식'을 보내주세요."}
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
        let samgo_breakfast, samgo_lunch, samgo_dinner;
        console.log("[알림] TimeZone 초기화 " + nd);
        console.log("[알림] 수정된 날짜: " + year.toString() + "-" + month.toString() + "-" + date.toString())

        //급식정보 API 불러오기
        console.log('[함수 선언 완료] 오늘의 급식'); //debug
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
        let date = nd.getDate() + 1; // 날짜 : 내일의 급식을 위해 1일 추가
        let samgo_breakfast, samgo_lunch, samgo_dinner;
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
        });
        console.log('[종료] 내일의 급식'); //debug
    } else if (payload == "week") {
        response = "아직 개발중이에요!"
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
    console.log('[알림] 메시지 전송');
}



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
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}
console.log('[초기화] CallSendAPI 완료!');
console.log('[초기화] 완료!');

