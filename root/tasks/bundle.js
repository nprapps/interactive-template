/*
Build a bundled app.js file using browserify
*/
module.exports = function(grunt) {

  var babel = require("babelify");
  var browserify = require("browserify");
  var exorcist = require("exorcist");
  var fs = require("fs");

  grunt.registerTask("bundle", "Build app.js using browserify", function(mode) {
    //run in dev mode unless otherwise specified
    mode = mode || "dev";
    var done = this.async();

    var b = browserify({ debug: mode == "dev" });
    b.transform(babel);

    //make sure build/ exists
    grunt.file.mkdir("build");
    var output = fs.createWriteStream("build/app.js");

    b.add("./src/js/main.js");
    var assembly = b.bundle();

    assembly.on("error", function(err) {
      grunt.log.errorlns(err.message);
      done();
    });

    if (mode == "dev") {
      //output sourcemap
      assembly = assembly.pipe(exorcist("./build/app.js.map", null, null, "."));
    }
    assembly.pipe(output).on("finish", function() {

      //correct path separators in the sourcemap for Windows
      var sourcemap = grunt.file.readJSON("./build/app.js.map");
      sourcemap.sources = sourcemap.sources.map(function(s) { return s.replace(/\\/g, "/") });
      grunt.file.write("./build/app.js.map", JSON.stringify(sourcemap, null, 2));
      
      done();
    });

  });

};
