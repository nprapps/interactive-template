var { google } = require("googleapis");
var { authenticate } = require("./googleauth");
var opn = require("opn");

module.exports = function(grunt) {

  var mimes = {
    sheets: "application/vnd.google-apps.spreadsheet",
    docs: "application/vnd.google-apps.document"
  };

  grunt.registerTask("google-create", "Create a linked Drive file (i.e., Google Sheets or Docs)", async function() {

    var done = this.async();

    var config = grunt.file.readJSON("project.json");
    var package = grunt.file.readJSON("package.json");
    var auth = null;
    try {
      auth = authenticate();
    } catch (err) {
      console.log(err);
      return grunt.fail.warn("Couldn't load access token for Docs, try running `grunt google-auth`");
    }
    var drive = google.drive({ auth, version: "v3" });

    var type = grunt.option("type")
    if (!type || !(type in mimes)) return grunt.fail.warn("Please specify --type=sheets or --type=docs");
    var mimeType = mimes[type];

    var name = grunt.option("name") || package.name;

    var result = await drive.files.create({ resource: { name, mimeType }});
    var file = result.data;

    if (!config[type]) config[type] = [];
    config[type].push(file.id);
    grunt.file.write("project.json", JSON.stringify(config, null, 2));

    opn(`https://drive.google.com/open?id=${file.id}`)

    done();

  });
};