const moment = require('moment');

const TwilightAPI = require('./twilight_api.js');

// A point on the earth's surface ignoring elevation
class Location {
    constructor(lat, lng) {
        this.lat = lat;
        this.lng = lng;
    }

    // return a random angle between -180 and 180,
    // used for initialising the "population"
    static randomAngle(min, max, precision=3) {
        let range = Math.abs(min) + Math.abs(max);
        let azimuth = (Math.random() * range + min).toFixed(precision);
        return parseFloat(azimuth);
    }

    // after the bare minimum of lat and lng are passed in
    // call APIs to hydrate the rest of the object's data
    hydrate(callback) {
        let twilightApi = new TwilightAPI();
        twilightApi.get(this.lat, this.lng, "now", (response) => {
            // convert timestamps to datetime objects
            // for comparison after the queue has drained
            this.sunrise = moment(response.results.sunrise, twilightApi.time_format);
            this.sunset = moment(response.results.sunset, twilightApi.time_format);
            this.day_length = moment(response.results.day_length, twilightApi.duration_format);
            // or this.day_length = this.sunset.subtract(this.sunrise);

            callback();
        });
    }
}

module.exports = Location