'use strict'

const token = EAABgdqZClqfcBANoeH8RhvMFPBlb2l3e8tH7dU1qhnbcl1VdbGzUhee2yVyVMRL4ZCLrEGYiFVR3JRWeCZCiXppaMifv64C8cYZB40nuDhJn0t4acshlVP7tWfm8sbHdyIFsjLBbm3t1tKZARespJdqm7ZAqKggTHWeKQ40XZAJLwZDZDN
const vtoken = anything

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === vtoken) {
        res.send(req.query['hub.challenge'])
    }
    res.send('No sir')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id
      if (event.message && event.message.text) {
        let text = event.message.text
        if (text === 'Generic') {
            sendGenericMessage(sender)
            continue
        }
        sendTextMessage(sender, "Message received: " + text.substring(0, 200))
      }
      if (event.postback) {
        let text = JSON.stringify(event.postback)
        sendTextMessage(sender, "Postback: "+text.substring(0, 200), token)
        continue
      }
    }
    res.sendStatus(200)
  })


function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;
const rp = require('minimal-request-promise');

module.exports = botBuilder((request, originalApiRequest) => {
  // If request is not postback
  if (!request.postback)
    // We'll get some basic info about the user
    return rp.get(`https://graph.facebook.com/v2.6/${request.sender}?fields=first_name&access_token=${originalApiRequest.env.facebookAccessToken}`)
      .then(response => {
        const user = JSON.parse(response.body)
        // Then let's send 2 text messages and one generic template with 3 elements/bubbles
        return [
          `Hello ${user.first_name}, welcome to Space Explorer! Ready to start a new journey through the space?`,
          'What can I do for you today?',
          return new fbTemplate.generic()
            .addBubble(`NASA's Astronomy Picture of the Day`, 'Satellite icon by parkjisun from the Noun Project')
              .addImage('https://raw.githubusercontent.com/stojanovic/space-explorer-bot/master/assets/images/apod.png')
              .addButton('Show', 'SHOW_APOD')
              .addButton('What is APOD?', 'ABOUT_APOD')
              .addButton('Website', 'http://apod.nasa.gov/apod/')
            .addBubble(`Photos from NASA's rovers on Mars`, 'Curiosity Rover icon by Oliviu Stoian from the Noun Project')
              .addImage('https://raw.githubusercontent.com/stojanovic/space-explorer-bot/master/assets/images/mars-rover.png')
              .addButton('Curiosity', 'CURIOSITY_IMAGES')
              .addButton('Opportunity', 'OPPORTUNITY_IMAGES')
              .addButton('Spirit', 'SPIRIT_IMAGES')
            .addBubble('Help & info', 'Monster icon by Paulo Sá Ferreira from the Noun Project')
              .addImage('https://raw.githubusercontent.com/stojanovic/space-explorer-bot/master/assets/images/about.png')
              .addButton('About the bot', 'ABOUT')
              .addButton('Credits', 'CREDITS')
              .addButton('Report an issue', 'https://github.com/stojanovic/space-explorer-bot/issues')
            .get();
        ];
      });
}




