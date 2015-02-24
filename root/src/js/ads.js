  var tag = window.googletag = window.googletag || { cmd: [], seatimes: { unit: "/81279359/seattletimes.com" } };
  
  tag.seatimes.presets = {
    banner: { sizes: [[728,90]], position: "Top" },
    square: { sizes: [[300, 250]], position: "Right1" },
    tall: { sizes: [[300, 600]], position: "Right" },
    right: { sizes: [[300, 600], [300, 250]], position: "Right" }
  };
  
  var gscript = document.createElement("script");
  gscript.async = true;
  gscript.defer = true;
  gscript.src = "//www.googletagservices.com/tag/js/gpt.js";
  document.head.appendChild(gscript);
  
  //initialize
  tag.cmd.push(function() {
    tag.pubads().setTargeting('tag', tag.seatimes.tags || []);
    tag.pubads().enableSingleRequest();
    tag.pubads().enableAsyncRendering();
    tag.pubads().collapseEmptyDivs();
    tag.enableServices();
  });