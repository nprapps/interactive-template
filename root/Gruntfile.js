

module.exports = function(grunt) {

  //load tasks
  grunt.loadTasks("./tasks");

  grunt.registerTask("template", "Perform a complete build of data and templates", ["state", "csv", "build"]);
  grunt.registerTask("default", ["less", "template", "connect:dev", "watch"]);
}