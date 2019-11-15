const request = require("request")
const util = require('util');

// base class for doing basic JSON API calls
class ApiTransport {
    // perform an HTTP GET from an endpoint
    // defined in the subclass
    get(url, callback) {
        return this.call(url, "", "get", callback);
    }

    // generic HTTP transport method with JSON parsing
    // request and response are logged to console
    call(url, body = "", method = "get", callback) {
        console.debug("Request: " + url);
        request[method]({
            "headers": {"content-type": "application/json"},
            "url": url,
            "body": JSON.stringify(body)
        }, (error, response, body) => {
            if (error) {
                return console.dir(error);
            }
            console.debug("Response: " + body);
            callback(JSON.parse(body));
        });
    }
}

// API client specific to the sunrise-sunset API
class TwilightAPI extends ApiTransport {
    constructor() {
        super();

        // formats specific to this API
        // used for parse timestamps
        this.time_format = "hh:mm:ss A"
        this.duration_format = "hh:mm:ss"
    }

    // overridden HTTP GET method from parent
    // to form API endpoint URL
    get(lat, lng, date = "now", callback) {
        let url = util.format(
            "https://api.sunrise-sunset.org/json?lat=%d&lng=%d&date=%s",
            lat,
            lng,
            date
        );

        super.get(url, callback);
    }
}

module.exports = TwilightAPI