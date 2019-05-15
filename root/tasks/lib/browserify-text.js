var path = require("path");
var through = require("through2");

var extensions = [".html", ".txt", ".svg"];

module.exports = function(file) {

  if (extensions.indexOf(path.extname(file)) > -1) {
    var buffer = [];
    return through(function(chunk, enc, done) {
      buffer.push(chunk.toString());
      done();
    }, function(done) {
      var text = buffer.join("");
      buffer = [];
      this.push("module.exports = " + JSON.stringify(text));
      this.push(null);
      done();
    });
  }

  return through();

};