/*
Build a bundled app.js file using browserify
*/
module.exports = function(grunt) {

  var browserify = require("browserify");
  var exorcist = require("exorcist");
  var fs = require("fs");

  grunt.registerTask("bundle", "Build app.js using browserify", function() {

    var done = this.async();

    var b = browserify({ debug: true });

    var output = fs.createWriteStream("build/app.js");

    b.add("./src/js/main.js");
    b.bundle().pipe(exorcist("build/app.js.map")).pipe(output).on("finish", function() {
      done();
    });

  });

};