/*
Build a bundled app.js file using browserify
*/
module.exports = function(grunt) {

  var browserify = require("browserify");
  var exorcist = require("exorcist");
  var fs = require("fs");

  grunt.registerTask("bundle", "Build app.js using browserify", function(mode) {
    //run in dev mode unless otherwise specified
    mode = mode || "dev";
    var done = this.async();

    var b = browserify({ debug: mode == "dev" });

    //make sure build/ exists
    grunt.file.mkdir("build");
    var output = fs.createWriteStream("build/app.js");

    b.add("./src/js/main.js");
    var assembly = b.bundle();
    if (mode == "dev") {
      //output sourcemap
      assembly = assembly.pipe(exorcist("build/app.js.map"));
    }
    assembly.pipe(output).on("finish", function() {
      done();
    });

  });

};
