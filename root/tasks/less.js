/*

Run the LESS compiler against seed.less and output to style.css.

*/

module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-less");

  grunt.config.merge({
    less: {
      dev: {
        src: "./src/css/seed.less",
        dest: "./build/style.css"
      }
    }
  });

};