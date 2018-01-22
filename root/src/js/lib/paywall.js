// pageId is a unique identifier for the current project
var paywall = function(pageId) {
  // Set global configs to enable the pagewall and identify the current page
  window.SEATIMESCO = window.SEATIMESCO || {};
  window.SEATIMESCO.paywall = window.SEATIMESCO.paywall || {};
  window.SEATIMESCO.contentInfo = window.SEATIMESCO.contentInfo || {};

  window.SEATIMESCO.paywall.contentMetered = true;
  window.SEATIMESCO.paywall.pageExcluded = false;
  window.SEATIMESCO.paywall.configsPath = "https://www.seattletimes.com/wp-json/paywall/settings";

  window.SEATIMESCO.contentInfo.domain = "projects.seattletimes.com";
  window.SEATIMESCO.contentInfo.post_id = pageId;
  window.SEATIMESCO.contentInfo.sections_all = "projects";

  var paywallScript = document.createElement("script");
  paywallScript.async = true;
  paywallScript.defer = true;
  paywallScript.src = "https://www.seattletimes.com/wp-content/plugins/st-user-messaging/dist/st-user-messaging-paywall-bundle.js";
  document.head.appendChild(paywallScript);
}

module.exports = paywall;
