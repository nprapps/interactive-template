/*

Builds a source package, starting from src/js/main.js

*/

var r = require("requirejs");
var shell = require("shelljs");
var project = require("../project.json");

module.exports = function(grunt) {

  grunt.registerTask("amd", "Compile AMD modules to build/main.js", function() {
    var c = this.async();

    var config = {
      baseUrl: "src/js",
      name: "main",
      include: ["almond.js"],
      out: "build/app.js",
      generateSourceMaps: true,
      preserveLicenseComments: false,
      optimize: "none",
      //common paths for bower packages
      //luckily, require won't complain unless we use them
      paths: {
        share: "lib/share.min",
        jquery: "lib/jquery/dist/jquery.min",
        pym: "lib/pym.js/src/pym",
        angular: "lib/angular/angular.min",
        leaflet: "lib/leaflet/dist/leaflet",
        icanhaz: "lib/icanhaz/ICanHaz.min"
      }
    };

    for (var key in project.require) {
      config[key] = project.require[key];
    }

    //build an optimized app bundle
    //include almond for resource loading
    r.optimize(config, c);
  })

};
