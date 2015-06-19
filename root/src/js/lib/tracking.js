//module for interfacing with GA
//automatically fires GA tracking on click/touch, require it for custom events
//NOTE: requires the _adFoot partial to load for GTM (embedded: false in project.json)

//ensure dataLayer exists
if (!window.dataLayer) {
  window.dataLayer = [];
}

/**
@param [category] - usually "interaction"
@param action - what happened
@param [label] - not usually visible in dashboard, defaults to title or URL
*/
var track = function(category, action, label) {
  if (!action) {
    action = category;
    category = "interaction";
  }
  label = label || document.title || window.location.href;
  window.dataLayer.push({
    event: "analyticsEvent",
    eventCategory: category,
    eventAction: action,
    eventLabel: label
  });
};

//set up default tracking events
["click", "touchstart"].forEach(e => track.bind(null, `interactive-page-${e}`));

var oneScroll = function() {
  track("interactive-page-scrolled");
  window.removeEventListener("scroll", oneScroll);
};
window.addEventListener("scroll", oneScroll);

module.exports = track;
