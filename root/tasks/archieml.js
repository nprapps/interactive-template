/*

Process text files as ArchieML
Anything that has a .txt extension in /data will be loaded

*/

var path = require("path");
var betty = require("@nprapps/betty");

module.exports = function(grunt) {

  grunt.registerTask("archieml", "Loads ArchieML files from data/*.txt", function() {

    grunt.task.requires("state");
    grunt.data.archieml = {};

    var files = grunt.file.expand("data/*.txt");

    files.forEach(function(f) {
      var name = path.basename(f).replace(/(\.docs)?\.txt$/, "");
      var contents = grunt.file.read(f);

      var parsed = betty.parse(contents, {
        onFieldName: t => t[0].toLowerCase() + t.slice(1)
      });
      grunt.data.archieml[name] = parsed;
    });

  });

};