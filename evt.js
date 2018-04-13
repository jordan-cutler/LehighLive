const unirest = require("unirest");
const moment = require("moment");
var fs = require('fs');
var parser = require('xml2json');

const EVT_FUNCTION_ACTION_NAME_TO_FUNCTION = {
    'today': (req, res) => {
        console.log("Event Today reached");
        let unirestReq = unirest("GET", "https://clients6.google.com/calendar/v3/calendars/indark@lehigh.edu/events?calendarId=indark%40lehigh.edu&singleEvents=true&timeZone=America%2FNew_York&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=2018-04-06T00%3A00%3A00-04%3A00&timeMax=2018-05-15T00%3A00%3A00-04%3A00&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs");
        unirestReq.headers({
            "Cache-Control": "no-cache"
        });
        unirestReq.end(function (result) {
            if (result.error) throw new Error(result.error);
            console.log(result.body);
            //let events = [];
            console.log(moment(Date.now()));
            const threeDaysFromNow = moment(Date.now()).add(4, 'd');
            const aWeekFromNow = moment(Date.now()).add(7, 'd');
            const threeDay = result.body.items.map(event => {
                const dateTime = event.start.dateTime;
                const eventName = event.summary;
                console.log('moment : ' + moment(dateTime).fromNow() + " " + moment(dateTime).isAfter(Date.now()) + " " + moment(dateTime).isBefore(threeDaysFromNow));
                if (moment(dateTime).isAfter(Date.now())) {
                    //events[i] = {"dateTime": dateTime};
                    if (moment(dateTime).isBefore(threeDaysFromNow)) {
                        const eventMoment = moment(dateTime);
                        return eventName + " on " + eventMoment.format("dddd, MMMM Do");
                    }
                }
            });
            console.log("EVENTS ARRAY");
            //console.log(events);
            console.log("3 DAY ARRAY");
            const filteredThreeDay = threeDay.filter(arr => arr);
            console.log(filteredThreeDay);
            handleRequest('2018-04-02', 'Breakfast');
            res.json({
                fulfillment_text: filteredThreeDay.join(', ')
            });
        });

        console.log("Does this reach")


    },

    'sports': (req, res) => {
        console.log("Sports reached");
        console.log("Sup");
        // var request = require("request");
        //
        // var options = { method: 'GET',
        //     url: 'https://clients6.google.com/calendar/v3/calendars/kist2c0k2bugt3p9vo4gsgfuprs4oame@import.calendar.google.com/events?calendarId=kist2c0k2bugt3p9vo4gsgfuprs4oame%40import.calendar.google.com&singleEvents=true&timeZone=America%2FNew_York&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=2018-04-01T00%3A00%3A00-04%3A00&timeMax=2018-05-06T00%3A00%3A00-04%3A00&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs',
        //
        //     headers:
        //         { 'Postman-Token': 'd42a0f1d-b3ae-4f3a-847e-2879508c1ef9',
        //             'Cache-Control': 'no-cache' } };
        //
        // request(options, function (error, response, body) {
        //     if (error) throw new Error(error);
        //
        //     console.log(body);
        //     // let itemList = JSON.parse(body.items);
        //     // var eventnames = new Array();
        //     // let names = itemList.map (event => {
        //     //     eventnames.push(event);
        //     // })
        //     // console.log(names);
        // });
        var unirest = require("unirest");

        // var req = unirest("GET", "https://clients6.google.com/calendar/v3/calendars/kist2c0k2bugt3p9vo4gsgfuprs4oame@import.calendar.google.com/events?calendarId=kist2c0k2bugt3p9vo4gsgfuprs4oame%40import.calendar.google.com&singleEvents=true&timeZone=America%2FNew_York&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=2018-04-01T00%3A00%3A00-04%3A00&timeMax=2018-05-06T00%3A00%3A00-04%3A00&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs");

        // req.headers({
        //     "Postman-Token": "3c269766-2b96-474a-a246-f6da16cd16f0",
        //     "Cache-Control": "no-cache"
        // });


        unirest.get('https://clients6.google.com/calendar/v3/calendars/kist2c0k2bugt3p9vo4gsgfuprs4oame@import.calendar.google.com/events?calendarId=kist2c0k2bugt3p9vo4gsgfuprs4oame%40import.calendar.google.com&singleEvents=true&timeZone=America%2FNew_York&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=2018-04-01T00%3A00%3A00-04%3A00&timeMax=2018-05-06T00%3A00%3A00-04%3A00&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs').end(function (res) {
            if (res.error) throw new Error(res.error);

            console.log(res.body);

            //     var eventnames = new Array();
            //     console.log("Before Map");
            //     let names = itemList.map (event => {
            //         eventnames.push(event);
            //     });
            console.log("After Map");
            let itemList = JSON.parse(res.body.items);


            // console.log(names);
        });

        res.json({
            fulfillment_text: "Sports Reached"
        });
    }
}

function handleRequest(menudate, meal) {
    //fs.readFile('food.xml', 'utf8', function (err, data) {
    var unirest = require("unirest");

    var req = unirest("GET", "http://mc.lehigh.edu/services/dining/resident/Rathbone/Week_14_Rathbone.xml");

    req.headers({
        "Postman-Token": "dfa2aeb8-c260-49d1-8b13-b48b10ff73d4",
        "Cache-Control": "no-cache"
    });


    unirest.get("http://mc.lehigh.edu/services/dining/resident/Rathbone/Week_14_Rathbone.xml").end( (function (res) {
        if (res.error) throw new Error(res.error);
        console.log(res.body);
        fs.writeFile('/food2.xml',res.body,null,null);
        var weeklyMenus = JSON.parse(res.body).VFPData.weeklymenu;
        var station = "";
        for (i in weeklyMenus) {
            var menu = weeklyMenus[i];
            if (menu['menudate'] == menudate && menu['meal'] == meal) {
                if (menu['station'] != station) {
                    station = menu['station'];
                    console.log(station + ' Station:');
                }
                console.log('\tItem: ' + menu['item_name']);
                if (menu['allergens'] != "") console.log('\t-', menu['allergens']);
                if (menu['station'] != "") console.log('\t-', menu['station']);
            }
        }
        console.log(res.body);
    }));



};
module.exports = EVT_FUNCTION_ACTION_NAME_TO_FUNCTION;
