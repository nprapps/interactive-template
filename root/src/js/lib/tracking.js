//module for interfacing with GA

/**
@param [category] - usually "interaction"
@param action - what happened
@param [label] - not usually visible in dashboard, defaults to title or URL
*/

var DIMENSION_PARENT_URL = 'dimension1';
var DIMENSION_PARENT_HOSTNAME = 'dimension2';
var DIMENSION_PARENT_INITIAL_WIDTH = 'dimension3';

var a = document.createElement("a");

var track = function(eventAction, eventLabel, eventValue) {
  var event = {
    eventAction,
    eventLabel,
    eventValue,
    hitType: "event",
    eventCategory: document.title
  }

  var search = window.location.search.replace(/^\?/, "");
  var query = {};
  search.split("&").forEach(pair => {
    var [key, value] = pair.split("=");
    query[key] = value;
  });
  var parentURL = query.parentUrl;
  a.href = parentURL;
  var hostname = a.hostname;

  event[DIMENSION_PARENT_URL] = parentURL;
  event[DIMENSION_PARENT_HOSTNAME] = hostname;

  if (window.ga) ga("send", event);
};

module.exports = track;
