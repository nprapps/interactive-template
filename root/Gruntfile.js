module.exports = function(grunt) {

  //load tasks
  grunt.loadTasks("./tasks");

  grunt.registerTask("template", "Perform a complete build of data and templates", ["state", "json", "csv", "build"]);
  grunt.registerTask("static", ["copy", "bundle", "less", "template"]);
  grunt.registerTask("default", ["static", "connect:dev", "watch"]);

};
