const async = require('async');
const util = require('util');
const moment = require('moment');

const Location = require('./location.js');
const queueWorkers = 5;
const queueDelay = 5; // seconds

// to avoid zero length days
// bring the constants below towards zero
const minimumLatitude = -60;
const maxumumLatitude = 60;

var locations = [];

// instantiate and hydrate location objects in a queue to limit
// API traffic
var queue = async.queue(function (coordinates, callback) {
    let location = new Location(coordinates.lat, coordinates.lng);
    location.hydrate(function delayNextBatch() {
        setTimeout(callback, queueDelay * 1000);
    });
    locations.push(location);
}, queueWorkers);

// compare all location sunrise objects to find the earliest
queue.drain(function () {
    let earliestSunrise = locations.reduce(function compareSunrise(a, b) {
        if (a.sunrise.isBefore(b.sunrise)) {
            return a;
        } else {
            return b;
        }
    });

    // output the duration of the day at the earliest location
    let message = util.format(
        "%d:%d has the earliest sunrise and a day length of %d seconds.",
        earliestSunrise.lat,
        earliestSunrise.lng,
        earliestSunrise.day_length.diff(moment().startOf('day'), 'seconds')
    );
    console.info(message);
});

// generate 100 locations and push
// them onto the queue for processing
for (var i = 0; i < 10; i++) {
    // lat is angle from the equator (0°) towards each pole ±90°
    // lng is angle around the equator from Greenwich (0° - ±180°)
    queue.push({lat: Location.randomAngle(minimumLatitude, maxumumLatitude), lng: Location.randomAngle(-180, 180)});
}

