var closest = require("./closest");

var delegate = function(root, event, selector, callback) {
  root.addEventListener(event, function(e) {
    var matching = closest(e.target, selector, root);
    if (matching) {
      callback.call(matching, e);
    }
  });
};

module.exports = delegate;