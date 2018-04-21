const unirest = require('unirest');
const moment = require('moment');
//const request = require("request");
const fs = require('fs');
const parser = require('xml2json');

const HEADERS = {
  'Cache-Control': 'no-cache'
};

const EVT_FUNCTION_ACTION_NAME_TO_FUNCTION = {
    'today': (req, res) => {
      console.log('Event Today reached');
      unirest('GET', 'https://clients6.google.com/calendar/v3/calendars/indark@lehigh.edu/events?calendarId=indark%40lehigh.edu&singleEvents=true&timeZone=America%2FNew_York&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=2018-04-06T00%3A00%3A00-04%3A00&timeMax=2018-05-15T00%3A00%3A00-04%3A00&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs')
        .headers(HEADERS)
        .end((result) => {
          if (result.error) {
            throw new Error(result.error);
          }
          console.log(result.body);
          //let events = [];
          console.log(moment(Date.now()));
          const threeDaysFromNow = moment(Date.now()).add(4, 'd');
          const aWeekFromNow = moment(Date.now()).add(7, 'd');
          const threeDay = result.body.items.map(event => {
            const dateTime = event.start.dateTime;
            const eventName = event.summary;
            console.log('moment : ' + moment(dateTime).fromNow() + ' ' + moment(dateTime).isAfter(Date.now()) + ' ' + moment(dateTime).isBefore(threeDaysFromNow));
            if (moment(dateTime).isAfter(Date.now())) {
              if (moment(dateTime).isBefore(threeDaysFromNow)) {
                const eventMoment = moment(dateTime);
                return eventName + ' on ' + eventMoment.format('dddd, MMMM Do');
              }
            }
          });
          console.log('EVENTS ARRAY');
          //console.log(events);
          console.log('3 DAY ARRAY');
          const filteredThreeDay = threeDay.filter(arr => arr);
          console.log(filteredThreeDay);
          const returnedJson = {
            fulfillment_text: filteredThreeDay.join(', ')
          };
          console.log(returnedJson);
          res.json(returnedJson);
        });
      console.log('Does this reach');
    },

    'sports':
      (req, res) => {
        console.log('Sports reached');
        const fileName = 'testdata/xml/athletics.xml';
        fs.readFile(fileName, 'utf8', function(err, data) {
          if (err) {
            return 'No athletics info found';
          }
          const jsonText = parser.toJson(data);
          const games = JSON.parse(jsonText)['scores']['game'];
          const gameString = games.reduce((gameString, currentGame) => {
            const currentTime = moment();
            const gameTime = moment(currentGame['time'], 'MM-DD-YYYY hh:mm:ss A');
            if (gameTime.isBetween(currentTime, currentTime.add(3, 'd'))) {
              const listItem = '- ' + currentGame['sport_abbrev'] + '\n';
              return gameString + listItem;
            }
            return gameString;
          });
          console.log(gameString);
        });

        res.json({
          fulfillment_text: 'Sports Reached'
        });
      }
  }
;
module.exports = EVT_FUNCTION_ACTION_NAME_TO_FUNCTION;
