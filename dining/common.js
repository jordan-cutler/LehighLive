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

// STRING LOOKS LIKE THIS = Mon-Thurs: 8:00am-7:00pm, Fri: 8:00am - 1:30pm
const getStartAndEndTimeBasedOnDate = (hoursString, date) => {
  const timeRangesSeparator = ',';
  // [ 'Mon-Thu: 7:00am-7:00pm', ' Fri: 7:00am-2:00pm' ]
  const timeRanges = hoursString.split(timeRangesSeparator).map(range => range.trim());
  for (const timeRange of timeRanges) {
    const startAndEndTimes = getStartAndEndTimesForTimeRangeAndDate(timeRange, date);
    const startAndEndTime = startAndEndTimes.find(({startTime, endTime}) => {
      console.log('START=', startTime);
      console.log('NOW=', moment(date));
      console.log('endTime', endTime);
      console.log('ISTRUE= ', moment(date).isBetween(startTime, endTime, 'day', '[]') || moment(date).isBetween(startTime, endTime, 'day', '[]'));
      console.log('--------------------------------');
      const dateIsOnSameDayAsRange = moment(date).isBetween(startTime, endTime, 'day', '[]');
      const dateHasntMovedPastEndTimeOfRange = date.isBefore(endTime);
      return dateIsOnSameDayAsRange && dateHasntMovedPastEndTimeOfRange;
    });
    if (startAndEndTime) {
      return startAndEndTime;
    }
  }
};

const getStartAndEndTimesForTimeRangeAndDate = (timeRange, date) => {
  const {startDay, endDay} = extractStartAndEndDayFromDayAndTimeRange(timeRange, date);
  const {startTime: unadjustedStartTime, endTime: unadjustedEndTime} = extractStartAndEndTimeFromDayAndTimeRange(timeRange);

  return getStartAndEndTimesByAmPmCases(startDay, endDay, unadjustedStartTime, unadjustedEndTime);
};

const getStartAndEndTimesByAmPmCases = (startDay, endDay, unadjustedStartTime, unadjustedEndTime) => {
  const times = [];
  const isPm = (momentTime) => momentTime.hours() >= 12;
  const isAm = (momentTime) => momentTime.hours() < 12;

  const currentDayInRange = moment(startDay);
  const runForEachDayInRange = (callback) => {
    while (currentDayInRange.isSameOrBefore(endDay, 'day')) {
      callback();
      currentDayInRange.add(1, 'day');
    }
  };
  const applyHoursMinutesAndSecondsToFirstFromSecond = (momentee, momenter) => {
    const hms = {
      hour: momenter.hours(),
      minute: momenter.minutes(),
      second: momenter.seconds()
    };
    return momentee.set(hms);
  };

  if (isPm(unadjustedStartTime) && isAm(unadjustedEndTime)) {
    runForEachDayInRange(() => {
      times.push({
        startTime: applyHoursMinutesAndSecondsToFirstFromSecond(currentDayInRange, unadjustedStartTime),
        endTime: applyHoursMinutesAndSecondsToFirstFromSecond(currentDayInRange, unadjustedEndTime).add(1, 'day')
      });
    });
  }
  else if (isAm(unadjustedStartTime) && isAm(unadjustedEndTime)) {
    runForEachDayInRange(() => {
      const end = applyHoursMinutesAndSecondsToFirstFromSecond(currentDayInRange, unadjustedEndTime);
      times.push({
        startTime: applyHoursMinutesAndSecondsToFirstFromSecond(currentDayInRange, unadjustedStartTime),
        // 10:00AM - 2:00AM for example. Need to add a day to 2AM
        endTime: unadjustedEndTime.isBefore(unadjustedStartTime) ? (end.add(1, 'day')) : (end)
      });
    });
  }
  else if (
    (isPm(unadjustedStartTime) && isPm(unadjustedEndTime)) ||
    (isAm(unadjustedStartTime) && isPm(unadjustedEndTime))
  ) {
    runForEachDayInRange(() => {
      times.push({
        startTime: applyHoursMinutesAndSecondsToFirstFromSecond(currentDayInRange, unadjustedStartTime),
        endTime: applyHoursMinutesAndSecondsToFirstFromSecond(currentDayInRange, unadjustedEndTime)
      });
    });
  }
  return times;
};

const extractStartAndEndDayFromDayAndTimeRange = (timeRange, date) => {
  const split = timeRange.split(' ').join('').split(':')[0].split('-');
  const startDay = moment(split[0], DAY_OF_WEEK_TOKEN).week(date.weeks());
  const endDay = moment(split[split.length - 1], DAY_OF_WEEK_TOKEN).week(date.weeks());
  if (date.days() === 0 && endDay.days() === 6) {
    startDay.subtract(1, 'week');
    endDay.subtract(1, 'week');
  }
  if (endDay.isBefore(startDay)) {
    endDay.add(1, 'week');
    console.log('AND', endDay);
  }
  console.log('RETURNING', {
    startDay: startDay,
    endDay: endDay
  });
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
  getStartAndEndTimeBasedOnDate: getStartAndEndTimeBasedOnDate,
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
