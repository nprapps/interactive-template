/*

This module sets up a `grunt.data` object to be used for shared state between
modules on each run. Modules that use it should require this task to make sure
that they get a clean state on each run. If Grunt starts emitting events,
we'll use those to automatically initialize.

*/

module.exports = function(grunt) {

  grunt.registerTask("state", "Initializes the shared state object", function() {
    grunt.data = {};
  });

};