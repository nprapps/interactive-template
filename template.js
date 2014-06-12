var exec = require("child_process").exec;

exports.description = "A standard starting-point for news app development at the Seattle Times."
exports.template = function(grunt, init, done) {
  //process
  init.process(init.defaults, [
    init.prompt("author_name"),
    init.prompt("app_name"),
    init.prompt("app_description")
  ], function(err, props) {
    var root = init.filesToCopy();
    init.copyAndProcess(root, props);
    grunt.file.mkdir("csv");
    //install node modules
    console.log("Installing Node modules...")
    exec("npm install", done);
  });
};