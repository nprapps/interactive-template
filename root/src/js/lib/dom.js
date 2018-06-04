module.exports = function(tagName, attributes = {}, children = []) {
  var parser = /^([^.]+)(\.[\.\w-]+)?/gi;
  var [_, tag, classes] = parser.exec(tagName);
  var element = document.createElement(tag);
  if (attributes instanceof Array || typeof attributes == "string") {
    children = attributes;
    attributes = {};
  }
  if (classes) {
    attributes["class"] = classes.split(".").join(" ").trim();
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
