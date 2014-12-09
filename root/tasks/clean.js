var shell = require("shelljs");

module.exports = function(grunt) {

  grunt.registerTask("clean", "Removes the build folder", function() {
    shell.rm("-rf", "build");
  });

};