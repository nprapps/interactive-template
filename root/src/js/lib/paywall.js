// pageId is a unique identifier for the current project
// do not call this function multiple times
var walled = false;

var paywall = function(pageID) {
  if (walled) return;
  walled = true;

  window.SEATIMESCO = {
    paywall: {
      contentMetered: true,
      pageExcluded: false,
      configsPath: "https://www.seattletimes.com/wp-json/paywall/settings"
    },
    contentInfo: {
      domain: "projects.seattletimes.com",
      post_id: pageID,
      sections_all: "projects"
    }
  }
  var paywallScript = document.createElement("script");
  paywallScript.async = true;
  paywallScript.defer = true;
  paywallScript.src = "https://www.seattletimes.com/wp-content/plugins/st-user-messaging/dist/st-user-messaging-paywall-bundle.js";
  document.head.appendChild(paywallScript);
}

module.exports = paywall;
