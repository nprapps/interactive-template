//module for interfacing with GA
//automatically fires GA tracking on click/touch, require it for custom events
//NOTE: requires the _foot partial to load for tracking (embedded: false in project.json)

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
  //send through GTM
  // window.dataLayer.push({
  //   event: "analyticsEvent",
  //   eventCategory: category,
  //   eventAction: action,
  //   eventLabel: label
  // });
  //send through GA
  if (window.ga) ga("send", "event", category, action, label);
};

//set up default tracking events
var oneScroll = function() {
  track("interactive-page-scrolled");
  window.removeEventListener("scroll", oneScroll);
};
window.addEventListener("scroll", oneScroll);

module.exports = track;
