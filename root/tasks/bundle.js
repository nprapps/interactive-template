/*
Build a bundled app.js file using browserify
*/
module.exports = function(grunt) {

  var browserify = require("browserify");
  var fs = require("fs");

  grunt.registerTask("bundle", "Build app.js using browserify", function() {

    var done = this.async();

    grunt.file.mkdir("build");

    var b = browserify({ debug: true });

    var output = fs.createWriteStream("build/app.js");

    b.add("./src/js/main.js");
    b.plugin("minifyify", { map: "app.js.map", output: "build/app.js.map" });
    b.bundle().pipe(output).on("finish", function() {
      done();
    });

  });

};