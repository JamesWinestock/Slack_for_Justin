// Uses Botkit, shedule and moment node modules
const express = require('express')
const bodyParser = require('body-parser')
const Botkit = require('./node_modules/botkit/lib/Botkit.js');
const os = require('os');
const schedule = require('node-schedule');
const moment = require('moment');
const _ = require('lodash');
const request = require('request');
const rp = require('request-promise');
const http = require('http');

// defines the schedule for posts using the schedule module

const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0,1,2,3,4,5,6];
rule.hour = [17];
rule.minute = [49];
rule.seconds = [00];

// uses the moment module to find the numerical value for the week of the year e.g. the week beggining 8th August 2016 is the 33rd week of the year

const datetime = new Date();
const dayOfWeek = moment().format('d')
const weekOfYear = moment().format('w')


const weekToInteger = parseInt(weekOfYear)
if(weekToInteger % 2 === 0) {
  weekIWantToUse = "2"
} else {
  weekIWantToUse = "1"
}
console.log('day:',dayOfWeek)
console.log('week:',weekIWantToUse)

const controller = Botkit.slackbot({
    debug: true
});

// define the url of my incoming webhook
const bot = controller.spawn({
  incoming_webhook: {
    url: "https://hooks.slack.com/services/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"
  }
})

function callUsers() {
  return rp('http://localhost:3000/users')
  .then(response => {
    var result = JSON.parse(response)
    return result
  })
}

callUsers().then((users) => {
  var cleaners = users.map(user => {
      if (user.day === dayOfWeek && user.week === weekIWantToUse){
        return `<@${user.name}>`
      }
  })


  var prettyCleaners = cleaners.join(', ')

  schedule.scheduleJob(rule, function() {

    // if (dayToClean === '1') { //if it's an even week send this webhook
    bot.sendWebhook({
      text: `${prettyCleaners}`, // prints the first array of names along with the clean message to slack
      channel: '#random', //goes to the random channel
      attachments: [
        {
          "text": "Have you cleaned?",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            { //buttons so the user can say they have cleaned. This is returned as JSON to a specifed address, for us it is our express app. You need to apply for a full slack app for these buttons to work
              "name": "yes",
              "text": "Yes",
              "type": "button",
              "value": "yes"
            },
            {
              "name": "no",
              "text": "No",
              "type": "button",
              "value": "no"
            }
          ]
        }
      ]
    })
  })
})
