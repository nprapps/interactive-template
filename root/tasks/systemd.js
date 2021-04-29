module.exports = function(grunt) {
  var os = require("os");
  var path = require("path");
  var child = require("child_process");

  grunt.registerTask("systemd", "Generate a valid systemd service file", function() {

    var template = grunt.file.read("tasks/lib/service.template");

    var NODE_VERSION = child.execSync("node -v", { encoding: "utf-8" }).trim().replace("v", "");

    var env = {
      GOOGLE_OAUTH_CLIENT_ID: null,
      GOOGLE_OAUTH_CONSUMER_SECRET: null,
      NODE_VERSION
    }
    for (var v in env) {
      if (env[v] === null) {
        env[v] = process.env[v];
      }
    }

    var home = os.homedir();
    var here = process.cwd();

    var data = { home, here, env };

    var output = grunt.template.process(template, data);

    grunt.file.write("deploy.service", output);

  });
};