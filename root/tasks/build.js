/*

Build HTML files using any data loaded onto the shared state. See also loadCSV
and loadSheets, which import data in a compatible way.

*/

// we use a custom template engine for better errors
var template = require("./lib/template");

var path = require("path");
var typogr = require("typogr");
var stmd = require("commonmark");

var writer = new stmd.HtmlRenderer();
var reader = new stmd.Parser();

//monkey-patch writer to handle typographical entities
var escape = writer.escape;
writer.escape = function(str) {
  return escape(str, true);
};

module.exports = function(grunt) {

  var process = function(source, data, filename) {
    var fn = template(source, { imports: { grunt: grunt, require: require }, sourceURL: filename });
    var input = Object.create(data || grunt.data);
    input.t = grunt.template
    return fn(input);
  };

  //expose this for other tasks to use
  grunt.template.process = process;

  grunt.template.formatNumber = function(s) {
    s = s + "";
    var start = s.indexOf(".");
    if (start == -1) start = s.length;
    for (var i = start - 3; i > 0; i -= 3) {
      s = s.slice(0, i) + "," + s.slice(i);
    }
    return s;
  };

  grunt.template.formatMoney = function(s) {
    s = grunt.template.formatNumber(s);
    return s.replace(/^(-)?/, function(_, captured) { return (captured || "") + "$" });
  };

  grunt.template.smarty = function(text) {
    var filters = ["amp", "widont", "smartypants", "ord"];
    filters = filters.map(k => typogr[k]);
    var filtered = filters.reduce((t, f) => f(t), text);
    return filtered;
  };

  grunt.template.include = function(where, data) {
    grunt.verbose.writeln(" - Including file: " +  where);
    var file = grunt.file.read(path.resolve("src/", where));
    var templateData = Object.create(data || grunt.data);
    templateData.t = grunt.template;
    return process(file, templateData, where);
  };

  grunt.template.renderMarkdown = function(input) {
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
    return typogr.smartypants(typogr.widont(rendered))
      .replace(/&#8211;/g, "&mdash;")
      .replace(/([’']) ([”"])/g, "$1&nbsp;$2");
  };

  grunt.registerTask("build", "Processes index.html using shared data (if available)", function() {
    var files = grunt.file.expandMapping(["**/*.html", "!**/_*.html", "!js/**/*.html"], "build", { cwd: "src" });
    var data = Object.create(grunt.data || {});
    data.t = grunt.template;
    files.forEach(function(file) {
      var src = file.src.shift();
      grunt.verbose.writeln("Processing file: " +  src);
      var input = grunt.file.read(src);
      var output = process(input, data, src);
      grunt.file.write(file.dest, output);
    });
  });

}