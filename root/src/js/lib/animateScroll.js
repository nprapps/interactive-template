var raf = window[require("./prefixed").requestAnimationFrame];

var animating = false;

var noop = function() {};
var ease = v => 0.5 - Math.cos( v * Math.PI ) / 2;

module.exports = function(element, done = noop) {
  if (animating) return;
  if (typeof element == "string") element = document.querySelector(element);

  var start = document.body.scrollTop || document.documentElement.scrollTop || 0;
  var bounds = element.getBoundingClientRect();
  var now = Date.now();
  var finish = start + bounds.top - 10;
  var distance = finish - start;
  if (Math.abs(distance) < 10) return;
  var duration = 500;

  var frame = function() {
    var t = Date.now();
    var elapsed = t - now;
    var d = elapsed / duration;
    document.body.scrollTop = document.documentElement.scrollTop = start + distance * ease(d);
    if (elapsed > duration) return animating = false;
    raf(frame);
  };

  animating = true;
  frame();
};