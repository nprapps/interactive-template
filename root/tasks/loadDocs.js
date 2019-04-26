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
     * Large document sets may hit rate limits; you can find details on your quota at:
     * https://console.developers.google.com/apis/api/drive.googleapis.com/quotas?project=<project>
     * where <project> is the project you authenticated with using `grunt google-auth`
     */
    async.eachLimit(
      config.docs,
      2, // adjust this up or down based on rate limiting
      async function(fileId) {
        var meta = await drive.files.get({ fileId });
        var name = meta.data.name.replace(/\s+/g, "_") + ".docs.txt";
        var body = await drive.files.export({ fileId, mimeType: "text/plain" });
        // strip Windows line breaks
        var text = body.data.replace(/\r\n/g, "\n");
        // replace triple breaks with regular paragraph breaks
        text = text.replace(/\n{3}/g, "\n\n");
        console.log(`Writing document as data/${name}`);
        grunt.file.write(path.join("data", name), text);
      },
      done
    );

  });
}
