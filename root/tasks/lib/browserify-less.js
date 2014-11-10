var less = require("less");
var path = require("path");
var through = require("through2");

var _ = function(tmp) {
  return tmp.toString().replace(/^.*\/\*\n*\s*|\*\/\}$/gm, "");
};

var lessTemplate = function() {/*
var style = document.createElement("style");
style.setAttribute("less", "{{file}}");
style.innerHTML = {{content}};
document.head.appendChild(style);
*/};

module.exports = function(file) {

  if (path.extname(file) == ".less") {
    var buffer = "";
    return through(function(chunk, enc, done) {
      buffer += chunk.toString();
      done();
    }, function(done) {
      var self = this;
      var dir = path.dirname(file);
      less.render(buffer, { paths: [dir] }, function(err, result) {
        if (err) {
          console.error(result);
          return done();
        }
        var output = _(lessTemplate).replace("{{file}}", path.basename(file)).replace("{{content}}", JSON.stringify(result.css));
        self.push(output);
        self.push(null);
        buffer = "";
        done();
      });
    });
  }

  return through();

};