var trackEvent = require("./tracking");

module.exports = new Promise((ok, fail) => {
  var url = "https://pym.nprapps.org/pym.v1.min.js";

  var script = document.createElement("script");
  script.src = url;
  document.head.appendChild(script);

  script.onload = function() {
    var child = new pym.Child({
      polling: 100
    });

    child.onMessage('on-screen', function(bucket) {
      trackEvent('on-screen', bucket);
    });

    child.onMessage('scroll-depth', function(data) {
      data = JSON.parse(data);
      trackEvent('scroll-depth', data.percent, data.seconds);
    });

    ok(child);
  };

  script.onerror = fail;

});