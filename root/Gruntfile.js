

module.exports = function(grunt) {

  //load tasks
  grunt.loadTasks("./tasks");

  grunt.registerTask("default", function() {
    console.log(grunt.config.get());
  });
}