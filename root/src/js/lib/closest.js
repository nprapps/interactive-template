var matches = require("./prefixed").matches;

module.exports = function(element, selector, limit = document.body) {
  while (element && !element[matches](selector) && element != limit) {
    element = element.parentNode;
  }
  if (element == limit) return null;
  return element;
};