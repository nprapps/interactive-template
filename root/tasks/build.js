/*

Build HTML files using any data loaded onto the shared state. See also loadCSV
and loadSheets, which import data in a compatible way.

*/

var path = require("path");

module.exports = function(grunt) {

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

  grunt.template.include = function(where, data) {
    grunt.verbose.writeln(" - Including file: " +  where);
    var file = grunt.file.read(path.resolve("src/", where));
    var templateData = Object.create(data || grunt.data);
    templateData.t = grunt.template;
    return grunt.template.process(file, {data: templateData});
  };

  grunt.registerTask("build", "Processes index.html using shared data (if available)", function() {
    var files = grunt.file.expandMapping(["**/*.html", "!**/_*.html", "!js/**/*.html"], "build", { cwd: "src" });
    var data = Object.create(grunt.data || {});
    data.t = grunt.template;
    files.forEach(function(file) {
      var src = file.src.shift();
      grunt.verbose.writeln("Processing file: " +  src);
      var input = grunt.file.read(src);
      var output = grunt.template.process(input, { data: data });
      grunt.file.write(file.dest, output);
    });
  });

}