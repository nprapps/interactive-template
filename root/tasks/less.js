/*

Run the LESS compiler against seed.less and output to style.css.

*/

module.exports = function(grunt) {

  var async = require("async");
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

  var options = {
    paths: ["src/css"],
    filename: "seed.less",
    plugins: [npmImporter]
  };

  grunt.registerTask("less", "Compile styles from src/css/seed.less", function() {

    var done = this.async();

    var seeds = {
      "src/css/seed.less": "build/style.css"
    };

    async.forEachOf(seeds, function(dest, src, c) {

      var seed = grunt.file.read(src);

      less.render(seed, options, function(err, result) {
        if (err) {
          grunt.fail.fatal(err.message + " - " + err.filename + ":" + err.line);
        } else {
          grunt.file.write(dest, result.css);
        }
        c();
      });

    }, done)

  });

};