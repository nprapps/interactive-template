var exec = require("child_process").exec;

exports.description = "A standard starting-point for news app development at the Seattle Times."
exports.template = function(grunt, init, done) {
  //process
  init.process(init.defaults, [
    init.prompt("author_name"),
    init.prompt("app_name"),
    init.prompt("app_description"),
    init.prompt("github_repo", "seattletimes/insert_repo_here")
  ], function(err, props) {
    //add environment variables, dynamic properties
    props.s3_key = process.env.AWS_ACCESS_KEY_ID || "";
    props.s3_secret = process.env.AWS_SECRET_ACCESS_KEY || "";
    props.s3_region = process.env.AWS_DEFAULT_REGION || "us-west-1";

    var root = init.filesToCopy(props);
    init.copyAndProcess(root, props);
    grunt.file.mkdir("csv");
    grunt.file.mkdir("json");
    grunt.file.mkdir("src/assets");

    //install node modules
    console.log("Installing Node modules...")
    exec("npm install --cache-min 999999", done);
  });
};