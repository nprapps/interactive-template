/*

Sets up a connect server to work from the /build folder. May also set up a
livereload server at some point.

*/

module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-connect");
  
  grunt.config.merge({
    connect: {
      dev: {
        options: {
          livereload: true,
          base: "./build"
        }
      }
    }
  })

};
