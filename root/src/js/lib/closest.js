var matches = require("./prefixed").matches;

module.exports = function(element, selector) {
  while (element && !element[matches](selector)) element = element.parentNode;
  return element;
};