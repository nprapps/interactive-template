/*

Build CSV into JSON and then load that structure onto the shared state object.
Will use cached data if it hasn't changed since the last run.

*/

var csv = require("csv");
var path = require("path");

module.exports = function(grunt) {

  grunt.registerTask("csv", "Convert CSV to JSON and load onto grunt.data", function() {

    grunt.task.requires("state");

    var files = grunt.file.expand("data/**/*.csv");

    grunt.data.csv = {};

    files.forEach(function(filename) {
      var file = grunt.file.read(filename);
      //strip out the empty lines that Excel likes to leave in.
      file = file.replace(/\r/g, "").split("\n").filter(function(line) { return line.match(/[^,]/) }).join("\n");
      var isKeyed = !!(file.split("\n").shift().match(/(^|,)key(,|$)/));
      var parsed = isKeyed ? {} : [];
      
      var parser = csv.parse({
        columns: true,
        auto_parse: true
      });
      parser.on("data", function(line) {
        //if "key" is a column, make this an object hash
        if (isKeyed) {
          var key = line.key;
          delete line.key;
          parsed[key] = line;
        } else {
          parsed.push(line);
        }
      });
      parser.on("finish", function() {
        console.log("Finished parsing", filename);
        var sanitized = path.basename(filename)
          .replace(".csv", "")
          .replace(/\W(\w)/g, function(_, letter) { return letter.toUpperCase() });
        console.log("Loaded onto grunt.data as", sanitized);
        grunt.data.csv[sanitized] = parsed;
      });
      parser.write(file);
      parser.end();
    });

  });

};