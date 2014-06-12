/*

Build HTML files using any data loaded onto the shared state. See also loadCSV
and loadSheets, which import data in a compatible way.

*/

module.exports = function(grunt) {

  grunt.registerTask("build", function() {

    var index = grunt.file.read("src/index.html");
    var data = grunt.data || {};
    var output = grunt.template.process(index, { data: data });
    grunt.file.write("build/index.html", output);

  });

}