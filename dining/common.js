const moment = require('moment');
const HOUR_MINUTE_FORMAT = 'h:mma';
const DAY_OF_WEEK_TOKEN = 'ddd';
const DATE_FROM_REQUEST_FORMAT = 'YYYY-MM-DD';

const RATHBONE_DIALOGFLOW_TITLE = 'Rathbone';
const CORT_DIALOGFLOW_TITLE = 'Cort';
const BRODHEAD_DIALOGFLOW_TITLE = 'Brodhead';
const RESIDENT_DINING_LOCATIONS = new Set([RATHBONE_DIALOGFLOW_TITLE, CORT_DIALOGFLOW_TITLE, BRODHEAD_DIALOGFLOW_TITLE]);
const RATHBONE_IMAGE_URL = 'https://farm5.staticflickr.com/4209/35803177536_3d1d8751f2_b.jpg';
const CORT_IMAGE_URL = 'http://www.lehigh.edu/undergradprospectus/img/community-opener.jpg';
const BRODHEAD_IMAGE_URL = 'https://content-service.sodexomyway.com/media/Brodhead_Hero_tcm50-8459_w1920_h976.jpg?url=https://lehigh.sodexomyway.com/';

const isResidentDiningLocation = (locationName) => RESIDENT_DINING_LOCATIONS.has(locationName);

const locationsJson = require('./data/formatLocations');
const allLocations = locationsJson.category.map(element => {
  return element.location;
}).reduce((acc, val) => acc.concat(val), []);

const getAllLocations = () => {
  return allLocations;
};

const getRequestedLocationObject = (locationName) => {
  return getAllLocations().find(location => {
    const locationNames = new Set([location.title, location.fulltitle, location.mapsearch]);
    return locationNames.has(locationName);
  });
};

const getLocationHoursStringByName = (locationName) => {
  return getRequestedLocationObject(locationName).hours;
};

const getStartAndEndTimeForToday = (hoursString) => {
  return getStartAndEndTimeForSpecifiedDate(hoursString, moment());
};

// STRING LOOKS LIKE THIS = Mon-Thurs: 8:00am-7:00pm, Fri: 8:00am - 1:30pm
const getStartAndEndTimeForSpecifiedDate = (hoursString, date) => {
  const timeRangesSeparator = ',';
  // [ 'Mon-Thu: 7:00am-7:00pm', ' Fri: 7:00am-2:00pm' ]
  const timeRanges = hoursString.split(timeRangesSeparator).map(range => range.trim());
  for (let i = 0; i < timeRanges.length; i++) {
    const timeRange = timeRanges[i];
    const startAndEndTimes = getStartAndEndTimesForRange(timeRange);
    const startAndEndTime = startAndEndTimes.find(({ startTime, endTime }) => {
      return moment(date).week(endTime.week()).isBetween(startTime, endTime);
    });
    if (startAndEndTime) return startAndEndTime;
  }
};

const getStartAndEndTimesForRange = (timeRange) => {
  const days = extractStartAndEndDayFromDayAndTimeRange(timeRange);
  let startDay = days.startDay;
  const endDay = days.endDay;

  const {startTime, endTime} = extractStartAndEndTimeFromDayAndTimeRange(timeRange);

  const isPm = (momentTime) => momentTime.hours() >= 12;
  const isAm = (momentTime) => momentTime.hours() < 12;

  const times = [];

  if (isPm(startTime) && isAm(endTime)) {
    while (startDay.days() !== (moment(endDay).add(1, 'day').days())) {
      times.push({
        startTime: moment(startTime).day(startDay.days()),
        endTime: moment(endTime).day(moment(startDay).add(1, 'day').days())
      });
      startDay.add(1, 'day');
    }
  } else if (isAm(startTime) && isAm(endTime)) {
    let isEndTimeOneDayBehind = false;
    // 10:00AM - 2:00AM for example. Need to add a day to 2AM
    if (endTime.isBefore(startTime)) {
      isEndTimeOneDayBehind = true;
    }
    // otherwise we have a case like 7:00AM - 11:00AM in which case they are on the same day
    while (startDay.days() !== (moment(endDay).add(1, 'day').days())) {
      times.push({
        startTime: moment(startTime).day(startDay.days()),
        endTime: isEndTimeOneDayBehind ? (moment(endTime).day(moment(startDay).add(1, 'day').days())) : (moment(endTime).day(moment(startDay).days()))
      });
      startDay.add(1, 'day');
    }
  } else if ((isPm(startTime) && isPm(endTime)) || (isAm(startTime) && isPm(endTime))) {
    while (startDay.days() !== (moment(endDay).add(1, 'day').days())) {
      times.push({
        startTime: moment(startTime).day(startDay.days()),
        endTime: moment(endTime).day(moment(startDay).days())
      });
      startDay.add(1, 'day');
    }
  }
  return times;
};

const extractStartAndEndDayFromDayAndTimeRange = (timeRange) => {
  const split = timeRange.split(' ').join('').split(':')[0].split('-');
  const startDay = moment(split[0], DAY_OF_WEEK_TOKEN);
  const endDay = moment(split[split.length - 1], DAY_OF_WEEK_TOKEN);
  if (endDay.isBefore(startDay)) {
    endDay.add(1, 'week');
  }
  return {
    startDay: startDay,
    endDay: endDay
  };
};

const extractStartAndEndTimeFromDayAndTimeRange = (timeRange) => {
  const replaced =
    timeRange
      .replace('a.m.', 'am')
      .replace('p.m.', 'pm')
      .split(' ')
      .join('');

  // [7:30am, 8:30pm]
  const startOfTimeRangeIndex = replaced.indexOf(':') + 1;
  const times = replaced.substring(startOfTimeRangeIndex).split('-'); // separate into the start time and end time
  return {
    startTime: moment(times[0], HOUR_MINUTE_FORMAT),
    endTime: moment(times[1], HOUR_MINUTE_FORMAT)
  };
};

module.exports = {
  getStartAndEndTimeForToday: getStartAndEndTimeForToday,
  isResidentDiningLocation: isResidentDiningLocation,
  getRequestedLocationObject: getRequestedLocationObject,
  getAllLocations: getAllLocations,
  getLocationHoursStringByName: getLocationHoursStringByName,
  HOUR_MINUTE_FORMAT: HOUR_MINUTE_FORMAT,
  DATE_FROM_REQUEST_FORMAT: DATE_FROM_REQUEST_FORMAT,
  RATHBONE_IMAGE_URL: RATHBONE_IMAGE_URL,
  CORT_IMAGE_URL: CORT_IMAGE_URL,
  BRODHEAD_IMAGE_URL: BRODHEAD_IMAGE_URL,
  RATHBONE_DIALOGFLOW_TITLE: RATHBONE_DIALOGFLOW_TITLE,
  CORT_DIALOGFLOW_TITLE: CORT_DIALOGFLOW_TITLE,
  BRODHEAD_DIALOGFLOW_TITLE: BRODHEAD_DIALOGFLOW_TITLE
};
