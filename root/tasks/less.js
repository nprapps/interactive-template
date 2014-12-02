/*

Run the LESS compiler against seed.less and output to style.css.

*/

module.exports = function(grunt) {

  var less = require("less");
  
  var options = {
    paths: ["src/css"],
    filename: "seed.less"
  };
  
  grunt.registerTask("less", function() {
    
    var c = this.async();
    
    var seed = grunt.file.read("src/css/seed.less");
    
    less.render(seed, options, function(err, result) {
      if (err) {
        grunt.fail.fatal(err.message + " - " + err.filename + ":" + err.line);
      } else {
        grunt.file.write("build/style.css", result.css);
      }
      c();
    });
    
  });

};