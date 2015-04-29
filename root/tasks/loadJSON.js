/*

Loads the project JSON file, as well as any matching files in the /json
folder, and attaches it to the grunt.data object as grunt.data.json.

*/

var path = require("path");

module.exports = function(grunt) {

  grunt.registerTask("json", "Load JSON for templating", function() {

    var files = grunt.file.expand(["project.json", "package.json", "data/**/*.json"]);

    grunt.task.requires("state");

    grunt.data.json = {};

    files.forEach(function(file) {
      var json = grunt.file.readJSON(file);
      var name = path.basename(file).replace(/(\.sheet)?\.json$/, "");
      grunt.data.json[name] = json;
    });

  });

}