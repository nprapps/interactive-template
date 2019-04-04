var { google } = require("googleapis");
var async = require("async");
var os = require("os");
var path = require("path");
var { authenticate } = require("./googleauth");

module.exports = function(grunt) {

  grunt.registerTask("docs", "Load Google Docs into the data folder", function() {

    var config = grunt.file.readJSON("project.json");
    var auth = null;
    try {
      auth = authenticate();
    } catch (err) {
      console.log(err);
      return grunt.fail.warn("Couldn't load access token for Docs, try running `grunt google-auth`");
    }

    var done = this.async();

    var drive = google.drive({ auth, version: "v3" });

    /*
     * Fetch the docs
     *
     * This is rate-limited to 2 concurrent async fetches at any given
     * time to avoid hitting Google's rate limits. 2 is the default;
     * you may be able to go higher. Read more about your quota at
     * https://console.developers.google.com/apis/api/drive.googleapis.com/quotas?project=<project>
     * where <project> is the project you authenticated with using `grunt google-auth`
     *
     * Rate limiting added for https://github.com/nprapps/interactive-template/issues/12
     *
     * Thanks to the following resources:
     *    https://caolan.github.io/async/docs.html#eachLimit
     *    https://stackoverflow.com/a/34865245
     */
    async.eachLimit(
      config.docs,
      2, // 2 concurrent fetches; can be higher or lower.
      async function(fileId) {
        var meta = await drive.files.get({ fileId });
        var name = meta.data.name.replace(/\s+/g, "_") + ".docs.txt";
        var body = await drive.files.export({ fileId, mimeType: "text/plain" });
        var text = body.data.replace(/\r\n/g, "\n");
        console.log(`Writing document as data/${name}`);
        grunt.file.write(path.join("data", name), text);
      },
      done
    );

  });
}
