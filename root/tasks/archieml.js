/*

Process text files as ArchieML
Anything that has a .txt extension in /data will be loaded

*/

var path = require("path");
var archieml = require("archieml");

module.exports = function(grunt) {

  grunt.registerTask("archieml", "Loads ArchieML files from data/*.txt", function() {

    grunt.task.requires("state");
    grunt.data.archieml = {};

    var files = grunt.file.expand("data/*.txt");

    files.forEach(function(f) {
      var name = path.basename(f).replace(/\.txt$/, "");
      var contents = grunt.file.read(f);
      var parsed = archieml.load(contents);
      grunt.data.archieml[name] = parsed;
    });

  });

};