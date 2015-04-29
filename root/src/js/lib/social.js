var Share = require("./share.min.js");

var addQuery = function(url, query) {
  var joiner = url.indexOf("?") > -1 ? "&" : "?";
  return url + joiner + query;
};

var utm = function(source, medium) {
  return `utm_source=${source}&utm_medium=${medium || "social"}&utm_campaign=projects`;
};

var here = window.location.href;

var s = new Share(".share", {
  ui: {
    flyout: "bottom left"
  },
  networks: {
    google_plus: {
      url: addQuery(here, utm("google+"))
    },
    twitter: {
      url: addQuery(here, utm("twitter"))
    },
    facebook: {
      url: addQuery(here, utm("facebook"))
    },
    pinterest: {
      url: addQuery(here, utm("pinterest"))
    }
  }
});

s.config.networks.email.description += " " + addQuery(here, utm("email_share", "email"));
