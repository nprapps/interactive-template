/*

Use Commonmark to parse *.md files and make them available via grunt.data.markdown

*/

var path = require("path");
var typo = require("typogr");
var stmd = require("commonmark");
var writer = new stmd.HtmlRenderer();
var reader = new stmd.Parser();

//monkey-patch writer to handle typographical entities
var escape = writer.escape;
writer.escape = function(str) {
  return escape(str, true);
};

module.exports = function(grunt) {

  grunt.registerTask("markdown", "Renders .md to HTML on grunt.data.markdown", function() {

    grunt.task.requires("state");

    //ignore markdown files inside the JS folder that come from Bower or libraries
    var files = grunt.file.expand("src/**/*.md", "!src/js/**/*.md");
    grunt.data.markdown = {};

    files.forEach(function(filename) {
      var input = grunt.file.read(filename);
      var parsed = reader.parse(input);
      var walker = parsed.walker();
      var event;
      while (event = walker.next()) {
        var node = event.node;
        if (event.entering && node.type == "Text") {
          node.literal = typo.smartypants(node.literal);
        }
      }
      var output = writer.render(parsed);
      var sansExtension = path.basename(filename).replace(/\..*?$/, "");
      grunt.data.markdown[sansExtension] = output;
    });

  });

};