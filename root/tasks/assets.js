/*

Copies the assets directory over to /build

*/

var shell = require("shelljs");

module.exports = function(grunt) {

  grunt.registerTask("copy", "Copy assets directory", function() {
    if (grunt.file.exists("src/assets")) {
      if (!grunt.file.exists("build/assets")) shell.mkdir("-p", "build/assets");
      // exclude the synced files
      // these are served directly from the connect task
      var files = grunt.file.expand(["src/assets/*", "!src/assets/synced"]);
      for (var f of files) {
        shell.cp("-r", f, "build/assets");
      }
    }
  });

}