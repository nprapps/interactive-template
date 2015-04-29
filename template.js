var exec = require("child_process").exec;
var path = require("path");

exports.description = "A standard starting-point for news app development at the Seattle Times."
exports.template = function(grunt, init, done) {
  //prelims
  var here = path.basename(process.cwd());

  //process
  init.process(init.defaults, [
    init.prompt("author_name"),
    init.prompt("app_name", here),
    init.prompt("app_description"),
    init.prompt("github_repo", "seattletimes/" + here)
  ], function(err, props) {
    //add environment variables, dynamic properties
    props.s3_key = process.env.AWS_ACCESS_KEY_ID || "";
    props.s3_secret = process.env.AWS_SECRET_ACCESS_KEY || "";
    props.s3_region = process.env.AWS_DEFAULT_REGION || "us-west-1";

    var root = init.filesToCopy(props);
    init.copyAndProcess(root, props);
    grunt.file.mkdir("data");

    //install node modules
    console.log("Installing Node modules...");
    exec("npm install --cache-min 999999", function(err, stdout, stderr) {
      console.log("Installing libraries from Bower...");
      exec("bower install", done);
    });
  });
};
