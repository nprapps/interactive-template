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

    async.each(config.docs, async function(fileId) {
      var meta = await drive.files.get({ fileId });
      var name = meta.data.name.replace(/\s+/g, "_") + ".docs.txt";
      var body = await drive.files.export({ fileId, mimeType: "text/plain" });
      var text = body.data.replace(/\r\n/g, "\n");
      console.log(`Writing document as data/${name}`);
      grunt.file.write(path.join("data", name), text);
    }, done);

  });
}