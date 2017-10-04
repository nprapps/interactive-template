module.exports = function(tagName, attributes = {}, children = []) {
  var element = document.createElement(tagName);
  if (attributes instanceof Array || typeof attributes == "string") {
    children = attributes;
    attributes = {};
  }
  for (var attr in attributes) {
    var value = attributes[attr];
    element.setAttribute(attr, value);
  }
  if (typeof children == "string") {
    element.innerHTML = children;
  } else {
    children.forEach(c => element.appendChild(c));
  }
  return element;
};
