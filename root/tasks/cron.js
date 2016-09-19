/*

Runs tasks on an automated basis

*/

/** config variables **/

var branch = "prod"; //Git branch for deployment
var interval = 1000 * 60 * 3; //30 minutes by default
var commands = [
  "git checkout " + branch, //grab latest
  "git pull origin " + branch,
  "npm i", //install any new packages
  "grunt sheets static publish:live" //deploy
];

/** end config **/

var async = require("async");
var chalk = require("chalk");
var shell = require("shelljs");

var cron = function() {
  var errors = [];
  var start = new Date();
  console.log(chalk.bgBlue.white("===Run: %s==="), start.toLocaleString());
  //execute each command, storing error codes for later
  async.eachSeries(commands, function(command, c) {
    var child = shell.exec(command, { async: true });
    child.on("exit", function(code) {
      if (code) {
        errors.push(code);
      }
      c();
    });
  }, function() {
    //check error code, log result
    var err = errors.length;
    var stick = err ? chalk.bgRed.white : chalk.bgBlue.white;
    var elapsed = Date.now() - start.getTime();
    console.log(stick("===Finished: %sms, %s ==="), elapsed, err ? "errors during publish" : "no errors");
    console.log("\n\n");
    //should be error-tolerant
    setTimeout(cron, interval);
  });
};

module.exports = function(grunt) {

  grunt.registerTask("cron", "Run the build on a timer", function() {
    //never completes!
    this.async();

    cron();

  });

};