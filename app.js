
/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Update the VERIFY_TOKEN
 * 4. Add your PAGE_ACCESS_TOKEN to your environment vars
 *
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
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

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
console.log('1');
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
console.log('2');

function handleMessage(sender_psid, received_message) {
    let response;
    console.log('2-1');
    // Checks if the message contains text
    if (received_message.text != "오늘의 급식") {
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        console.log('2-2'); //debug
        response = {
            "text": `You sent the message: "${received_message.text}". Now send me an attachment!`,
        }
    } else if (received_message.text == "오늘의 급식") {
        //오늘 날짜를 가져옵니다.
        console.log('2-3'); //debug
        var json; // json 윗쪽에 변수 선언
        let today = new Date();   
        let year = today.getFullYear(); // 년도
        let month = today.getMonth() + 1;  // 월
        let date = today.getDate();  // 날짜
        let today_lunch, today_dinner;
        //급식정보 API 불러오기
        console.log('2-4'); //debug
        const url = `https://schoolmenukr.ml/api/high/S100000591?date=${date}`;
        request(url, (err, res, body) => {
            json = JSON.parse(body);
            //console.log(json); // 파싱한 json 로그 출력
            today_lunch = json["menu"][0]['lunch']; // 점심 정보 가져오기
            today_dinner = json["menu"][0]['dinner'] // 저녁 정보 가져오기
            console.log('[LOG]' + today_lunch);
            console.log('[LOG]' + today_dinner);
            today_lunch = str(today_lunch);
            today_lunch = str.replace(/,/g, "\n");
            response = {
                "text": `${month}월 ${date}일의 급식 정보입니다.\n[점심]\n${today_lunch}\n[저녁]\n${today_dinner}`
            }
            callSendAPI(sender_psid, response);
            console.log('[END] request');
        });
        console.log('2-5'); //debug
        //var today_date = json["menu"][0]['date'] // 급식 표에 적힌 날짜 가져오기 //오류 발생
       
        console.log(today_lunch)
        console.log('2-6'); //debug
        
        /*
        for (var i = 0; i < json["menu"][0]['dinner'].length; i++) { //배열 출력
            console.log(i);
            let response = (json["menu"][0]['dinner'][i] + "<br>");
        } */
        console.log('2-7'); //debug
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
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
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
console.log('3');

function handlePostback(sender_psid, received_postback) {
    console.log('ok')
    let response;
    // Get the payload for the postback
    let payload = received_postback.payload;
    // 오늘의 날짜를 가져옵니다.
    let today = new Date();   


    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = { "text": "Thanks!" }
    } else if (payload === 'no') {
        response = { "text": "Oops, try sending another image." }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}
console.log('4');

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
console.log('5');
