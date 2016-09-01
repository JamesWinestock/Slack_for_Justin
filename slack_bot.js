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
rule.hour = [11];
rule.minute = [22];
rule.seconds = [00];

const inspiration = [
  "I wish my bank account filled up as fast as the kitchen sink", "A positive attitude may not solve all your problems, but it will annoy enough people to make it worth it", "Why can't the kitchen clean itself? It gets dirty by itself!", "I can't believe I'm spending half my afternoon cleaning up the kitchen. I mean, half these plates aren't even mine.", "I understand the concept of cleaning. Just not as it applies to me.", "Cleaning is just putting stuff in less obvious places", "I love cleaning up messes I didn't make... so I became a dev!", "'I noticed the kitchen needed cleaning so I just did it' said no one ever.", "Cleaning can't kill you but why take the chance?", "Cleaning is coming, brace yourself", "Not sure if actually cleaning or just moving stuff slowly around the room...", "Cleaning? Aint nobody got time for that", "Makes you clean kitchen... because cleaners are coming this evening.", "Confucius says: 'You cannot clean something without first making something else dirty'", "I pitty the fool who doesn't clean the office kitchen!", "Half assed cleaning, half asses cleaning everywhere", "What I do have are a very particular set of skills, skills I have aquired over a very long career. Skills that make me a nightmare for people like you. If you clean the kitchen now, that'll be the end of it. But if you don't, I will look for you, I will find you, and I will make you clean.", "These dishes were cleaned easily, but they will be back and in greater numbers", "One does not simply leave the kitchen dirty after 4pm", ""
]

console.log(inspiration.length)

var randomQuote = inspiration[Math.floor(Math.random() * inspiration.length)];

console.log(randomQuote)

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
      channel: '#cleaningtest', //goes to the random channel
      attachments: [
        {
          "text": `${randomQuote}`,
          "color": "#3AA3E3",
          "attachment_type": "default",
          // "actions": [
          //   { //buttons so the user can say they have cleaned. This is returned as JSON to a specifed address, for us it is our express app. You need to apply for a full slack app for these buttons to work
          //     "name": "yes",
          //     "text": "Yes",
          //     "type": "button",
          //     "value": "yes"
          //   },
          //   {
          //     "name": "no",
          //     "text": "No",
          //     "type": "button",
          //     "value": "no"
          //   }
          // ]
        }
      ]
    })
  })
})
