/*

Builds a source package, starting from src/js/main.js

*/

var r = require("requirejs");
var shell = require("shelljs");

module.exports = function(grunt) {

  grunt.registerTask("amd", "Compile AMD modules to build/main.js", function() {
    var c = this.async();

    //make sure the require seed exists
    //this is deprecated in favor of Almond as the loader
    /*
    if (!grunt.file.exists("src/require.js")) {
      grunt.file.copy("./node_modules/requirejs/require.js", "src/js/require.js");
    }
    */

    //build an optimized app bundle
    //include almond for resource loading
    r.optimize({
      baseUrl: "src/js",
      name: "main",
      include: ["almond.js"],
      out: "build/app.js",
      generateSourceMaps: true,
      preserveLicenseComments: false,
      optimize: "none"
    }, c);
  })

};
