/*

Build HTML files using any data loaded onto the shared state. See also loadCSV
and loadSheets, which import data in a compatible way.

*/

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
    var file = grunt.file.read(where);
    return grunt.template.process(file, data || this);
  };

  grunt.registerTask("build", function() {
    var index = grunt.file.read("src/index.html");
    var data = Object.create(grunt.data) || {};
    data.t = grunt.template;
    var output = grunt.template.process(index, { data: data });
    grunt.file.write("build/index.html", output);
  });

}