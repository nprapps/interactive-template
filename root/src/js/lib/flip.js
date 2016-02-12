var { transform, transformOrigin } = require("./prefixed");

module.exports = function(element, mutate) {
  var first = element.getBoundingClientRect();
  
  mutate();

  var last = element.getBoundingClientRect();

  var diff = {
    x: first.left - last.left,
    y: first.top - last.top,
    scaleX: first.width / last.width,
    scaleY: first.height / last.height
  };

  element.style[transformOrigin] = "0 0";
  element.style[transform] = `translateX(${diff.x}px) translateY(${diff.y}px) scaleX(${diff.scaleX}) scaleY(${diff.scaleY})`;
  var reflow = element.offsetWidth;
  element.style.transition = "all .5s ease-in-out";
  element.style[transform] = "";
  setTimeout(function() {
    element.style.transition = "";
    element.style[transformOrigin] = "";
  }, 500);
};