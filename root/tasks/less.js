/*

Run the LESS compiler against seed.less and output to style.css.

*/

module.exports = function(grunt) {

  var fs = require("fs");
  var less = require("less");
  
  var options = {
    paths: ["src/css"],
    filename: "seed.less"
  };
  
  grunt.registerTask("less", function() {
    
    var c = this.async();
    
    var seed = grunt.file.read("src/css/seed.less");
    
    var parser = new less.Parser(options);
    parser.parse(seed, function(err, tree) {
      var css = tree.toCSS();
      grunt.file.write("build/style.css", css);
      c();
    });
    
  });

};