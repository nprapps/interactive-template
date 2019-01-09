/*

Sets up a connect server to work from the /build folder. May also set up a
livereload server at some point.

*/

var fs = require("fs");
var path = require("path");
var url = require("url");

module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-connect");
  
  grunt.config.merge({
    connect: {
      dev: {
        options: {
          hostname: "localhost",
          useAvailablePort: true,
          port: grunt.option("port") || 8000,
          livereload: grunt.option("reloadport") * 1 || 35739,
          base: "./build",
          //middleware to protect against case-insensitive file systems
          middleware: function(connect, options, ware) {
            var base = options.base.pop();
            ware.unshift(function(req, response, next) {
              var href = url.parse(req.url).pathname;
              var location = path.join(base, href);
              var filename = path.basename(href);
              if (!filename) return next();
              var dir = path.dirname(location);
              fs.readdir(dir, function(err, list) {
                if (!err && list.indexOf(filename) == -1) {
                  response.statusCode = 404;
                  response.end("<pre>            404 Not Found\n-this space intentionally left blank-</pre>");
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
