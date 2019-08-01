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
    var render = grunt.template.renderMarkdown = function(input) {
      var parsed = reader.parse(input);

      var walker = parsed.walker();
      //merge text nodes together
      var e;
      var previous;
      while (e = walker.next()) {
        var node = e.node;
        //is this an adjacent text node?
        if (node && previous && previous.parent == node.parent && previous.type == "Text" && node.type == "Text") {
          previous.literal += node.literal;
          // grunt.log.oklns(previous.literal);
          node.unlink();
        } else {
          previous = node;
        }
      }

      var rendered = writer.render(parsed);
      return typo.smartypants(typo.widont(rendered)).replace(/&#8211;/g, "&mdash;");
    };

    files.forEach(function(filename) {
      var input = grunt.file.read(filename);
      var sansExtension = path.basename(filename).replace(/\..*?$/, "");

      //define these as getters, so that templating can be processed out-of-order at runtime

      Object.defineProperty(grunt.data.markdown, sansExtension, {
        get: function() {
          //run this through the template system
          input = grunt.template.process(input);
          var output = render(input);
          
          //strip HTML block hack
          output = output.replace(/\<\?|\?\>/g, "");
          return output;
        }
      });


    });

  });

};