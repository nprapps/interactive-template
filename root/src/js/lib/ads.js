  var tag = window.googletag = window.googletag || { cmd: [], seatimes: { unit: "/81279359/seattletimes.com" } };

  var bannerMapping = {
    768: [[728,90]],
    1: [[300, 50]]
  };

  tag.seatimes.presets = {
    banner: { sizes: [[728,90]], sizeMapping: bannerMapping, position: "top" },
    square: { sizes: [[300, 250]], position: "right1" },
    tall: { sizes: [[300, 600]], position: "right" },
    right: { sizes: [[300, 600], [300, 250]], position: "right" },
    bannerBottom: { sizes: [[728,90]], sizeMapping: bannerMapping, position: "bottom" },
    interstitial: { sizes: [[1,1]], position: "inter" }
  };

  var gscript = document.createElement("script");
  gscript.async = true;
  gscript.defer = true;
  gscript.src = "//www.googletagservices.com/tag/js/gpt.js";
  setTimeout(() => document.head.appendChild(gscript), 1000);

  //initialize
  tag.cmd.push(function() {
    tag.pubads().setTargeting('tag', tag.seatimes.tags || []);
    tag.pubads().enableSingleRequest();
    tag.pubads().enableAsyncRendering();
    tag.pubads().collapseEmptyDivs();
    tag.enableServices();
  });
