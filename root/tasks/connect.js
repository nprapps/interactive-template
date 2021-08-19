/*

Sets up a connect server to work from the /build folder.
Synced asset files are served directly from src/assets.

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
          middleware: function(connect, options, ware) {
            var base = options.base.pop();
            //middleware to protect against case-insensitive file systems
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
            // add ability to serve files directly from synced assets
            ware.unshift(function(req, response, next) {
              var href = url.parse(req.url).pathname;
              var location = path.join(base, href);
              var filename = path.basename(href);
              var isSynced = /^\/?assets\/synced\//;
              var syncedFolder = "./src/assets/synced/";
              if (isSynced.test(href)) {
                var file = href.replace(isSynced, "");
                var stream = fs.createReadStream(path.join(syncedFolder, file));
                stream.pipe(response);
                return;
              }
              next();
            });
            return ware;
          }
        }
      }
    }
  })

};