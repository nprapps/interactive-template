// we need to plug into the LESS import statement for node modules
// Sadly, the less-plugin-npm-import module doesn't handle this well
// It assumes that we have all our dependencies at the top level
var resolve = require("resolve").sync;

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
      try {
        var resolved = resolve(file, {
          extensions: [".less", ".css"],
          packageFilter: function(package) { 
            if (package.style) package.main = package.style;
            return package;
          }
        });
        return resolved;
      } catch (err) {
        console.log(err);
      }
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

module.exports = npmImporter;