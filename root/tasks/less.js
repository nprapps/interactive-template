/*

Run the LESS compiler against seed.less and output to style.css.

*/

module.exports = function(grunt) {

  var async = require("async");
  var less = require("less");

  var path = require("path");
  var through = require("through2");
  var npmImporter = require("./lib/npm-less");

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