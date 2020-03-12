/*

Runs tasks on an automated basis

*/

/** config variables **/
var tasks = {
  local: ["sheets", "static", "connect"],
  publish: ["sheets", "clean", "static", "publish"],
  publishLive: ["sheets", "clean", "static", "publish:live"]
};

/** end config **/

var async = require("async");
var chalk = require("chalk");
var shell = require("shelljs");

module.exports = function(grunt) {

  grunt.registerTask("cron", "Run the build on a timer", function(interval = 15, target = "local") {
    var done = this.async();

    console.log(`Setting ${interval} second timer for a ${target} target...`);

    setTimeout(function() {
      var run = tasks[target] || tasks.local;
      grunt.task.run(run);
      grunt.task.run([`cron:${interval}:${target}`]);
      done();
    }, interval * 1000);

  });

};