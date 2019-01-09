/*

Standard configuration from grunt-contrib-watch:
- Compile LESS when source files change
- Compile page template when index.html changes
- Compile JSON data when CSVs change
- (optional) Run optimizer on AMD modules when JS files change

*/

module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.config.merge({
    watch: {
      options: {
        spawn: false,
        livereload: grunt.option("reload-port") * 1 || 35739
      },
      less: {
        files: ["src/**/*.less"],
        tasks: ["less"]
      },
      templates: {
        files: ["src/**/*.html", "data/**/*", "src/**/*.md"],
        tasks: ["template"]
      },
      js: {
        files: ["src/js/**/*"], //everything, due to templating, GLSL, LESS, etc.
        tasks: ["bundle"]
      }
    }
  });

};
