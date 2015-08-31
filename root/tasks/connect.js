/*

Sets up a connect server to work from the /build folder. May also set up a
livereload server at some point.

*/

var fs = require("fs");
var path = require("path");

module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-connect");
  
  grunt.config.merge({
    connect: {
      dev: {
        options: {
          livereload: true,
          base: "./build",
          //middleware to protect against case-insensitive file systems
          middleware: function(connect, options, ware) {
            var base = options.base.pop();
            ware.unshift(function(req, response, next) {
              var location = path.join(base, req.url);
              var filename = path.basename(req.url);
              if (!filename) return next();
              var dir = path.dirname(location);
              fs.readdir(dir, function(err, list) {
                if (list.indexOf(filename) == -1) {
                  response.statusCode = 404;
                  response.end();
                } else {
                  next();
                }
              })
            });
            return ware;
          }
        }
      }
    }
  })

};
