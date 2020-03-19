var delegate = function(root, event, selector, callback) {
  root.addEventListener(event, function(e) {
    var matching = e.target.closest(selector);
    if (matching && root.contains(matching)) {
      callback.call(matching, e);
    }
  });
};

module.exports = delegate;