/*

Use Commonmark to parse *.md files and make them available via grunt.data.markdown

*/

var path = require("path");
var typo = require("typogr");
var stmd = require("./lib/stmd");
var writer = new stmd.HtmlRenderer();
var reader = new stmd.DocParser();

//monkey-patch writer to handle typographical entities
var escape = writer.escape;
writer.escape = function(str) {
  return escape(str, true);
};

//perform typographical replacement on inline blocks
var walkInline = function(inline) {
  if (inline.t == "Str") {
    inline.c = typo.smartypants(inline.c);
  } else if (inline.c instanceof Array) {
    inline.c.forEach(walkInline);
  }
};

//look for inline blocks to process
var walk = function(block) {
  var leaves = ["Paragraph", "ATXHeader"];
  if (leaves.indexOf(block.t) > -1) {
    block.inline_content.forEach(walkInline);
  }
  for (var i = 0; i < block.children.length; i++) {
    walk(block.children[i]);
  }
};

module.exports = function(grunt) {

  grunt.registerTask("markdown", "Renders .md to HTML on grunt.data.markdown", function() {

    grunt.task.requires("state");

    var files = grunt.file.expand("src/**/*.md", "!src/js/**/*.md");
    grunt.data.markdown = {};

    files.forEach(function(filename) {
      var input = grunt.file.read(filename);
      var parsed = reader.parse(input);
      walk(parsed);
      var output = writer.render(parsed);
      var sansExtension = path.basename(filename).replace(/\..*?$/, "");
      grunt.data.markdown[sansExtension] = output;
    });

  });

};