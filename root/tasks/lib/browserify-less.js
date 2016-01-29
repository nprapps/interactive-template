var less = require("less");
var path = require("path");
var through = require("through2");
var resolve = require("resolve").sync;

// we need to plug into the LESS import statement for node modules
// Sadly, the less-plugin-npm-import module doesn't handle this well
// It assumes that we have all our dependencies at the top level
var npmImporter = {
  install: function(less, pluginManager) {

    var FileManager = function() {};
    FileManager.prototype = new less.FileManager();
    FileManager.prototype.supports = function(file, dir) {
      return file.indexOf("npm://") == 0;
    };
    FileManager.prototype.supportsSync = FileManager.prototype.supports;
    FileManager.prototype.resolve = function(file) {
      file = file.replace("npm://", "");
      var resolved = resolve(file, {
        extensions: [".less", ".css"],
        packageFilter: function(package) { 
          if (package.style) package.main = package.style;
          return info;
        }
      });
      return resolved;
    };
    FileManager.prototype.loadFile = function(url, dir, options, env) {
      var filename = this.resolve(url);
      return less.FileManager.prototype.loadFile.call(this, filename, "", options, env);
    };
    FileManager.prototype.loadFileSync = function(url, dir, options, env) {
      var filename = this.resolve(url);
      return less.FileManager.prototype.loadFileSync.call(this, filename, "", options, env);
    };

    pluginManager.addFileManager(new FileManager());
  },
  minVersion: [2, 1, 1]
};

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

  if (path.extname(file).match(/\.(css|less)/)) {
    var buffer = "";
    return through(function(chunk, enc, done) {
      buffer += chunk.toString();
      done();
    }, function(done) {
      var self = this;
      var options = {
        paths: [ path.dirname(file) ],
        plugins: [ npmImporter ]
      };

      less.render(buffer, options, function(err, result) {
        if (err) {
          console.error(err);
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