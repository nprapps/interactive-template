var xhr = require("./xhr");

var endpoint = "https://maps.googleapis.com/maps/api/geocode/json?address="

module.exports = {
  address: function(address, callback) {
    address = address.replace(/\s/g, '+');
    var bounds = "&bounds=47.4955511,-122.4359085|47.734145,-122.2359032";
    xhr(endpoint + address + bounds, function(err, data) {
      if (err) return callback(err);
      if (data.status == "ZERO_RESULTS") {
        // invalid entry
        callback("No results");
      } else if (data.results[0].formatted_address.indexOf("Seattle") < 0) {
        // not in seattle
        callback("Not in Seattle");
      } else {
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;

        callback(null, [lat, lng]);
      }
    });
  },
  gps: function(callback) {
    navigator.geolocation.getCurrentPosition(function(gps) {
      callback(null, [gps.coords.latitude, gps.coords.longitude]);
    }, err => callback(err));
  }
};