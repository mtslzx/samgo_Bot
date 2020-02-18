const fetch = require('node-fetch');

function handlePostback(sender_psid, receivedPostback) {
    if (payload == 'defined_payload') {
        response = {
            text: 'Some text'
        };
        response2 = //... Another response
            response3 = //... Another response
            callSendAPI(sender_psid, response).then(() => {
                return callSendAPI(sender_psid, response2).then(() => {
                    return callSendAPI(sender_psid, response3); // You can add as many calls as you want
                });
            });
    }
}

function callSendAPI(sender_psid, response) {
    let body = {
        recipient: {
            id= sender_psid
        },
        message: response
    };
    const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN); // Here you'll need to add your PAGE TOKEN from Facebook
    return fetch('https://graph.facebook.com/me/messages?' + qs, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}