/*

Batch-adds a set of default issues in the GitHub repo, reading from tasks/issues.csv

Underlying spreadsheet for the CSV of default issues:
https://docs.google.com/spreadsheets/d/15RxPFHe4CMXMDYuPR2jkvGnbj3w3T5PhPD7BBYb3sgs/edit?gid=0#gid=0

You will need to have a fine-grained personal access token set up for your account:
https://github.com/settings/tokens

- Repository access:
  Specify the repos this token needs access to. Scope it to just the repo(s) you 
  currently need to update (you can update it later).

- Repository permissions:
  - READ access to code and metadata
  - READ and WRITE access to issues

Add the token and your username to your .zshrc (or equivalent) as environment variables:
export GITHUB_PERSONAL_TOKEN="__TOKEN__"
export GITHUB_USER="__GITHUB_USERNAME__"

Run this task with `grunt issues`

*/

var https = require("https");
var csv = require("csv");

module.exports = function(grunt) {

  grunt.registerTask("issues", function() {
    var token = process.env.GITHUB_PERSONAL_TOKEN;
    var user = process.env.GITHUB_USER;
    if (!token || !user) grunt.fail.fatal("Unable to read GitHub creds from the environment.");

    var wait = function(delay = 100) {
      return new Promise(ok => setTimeout(ok, delay));
    }

    var post = function(url, body) {
      var auth = [user, token].join(":");
      url = new URL(url);
      var options = {
        method: "POST",
        host: url.host,
        path: url.pathname,
        headers: {
          "User-Agent": "NPR Interactive Template"
        },
        auth
      };
      return new Promise(function(ok, fail) {
        var request = https.request(options, function(response) {
          ok(response);
        });
        request.on("error", fail);
        request.end(body);
      });
    };

    var done = this.async();

    var package = grunt.file.readJSON("package.json");
    var repo = package.repository.url;
    var [_, org, repo] = repo.match(/github.com\/([^\/]+)\/(.+?)\.git/);
    console.log(`Setting up issues on ${org}/${repo}...`);

    var issuesFile = grunt.file.read("tasks/issues.csv");
    csv.parse(issuesFile, { columns: true }, async function(err, issues) {
      for (var i = 0; i < issues.length; i++) {
        var issue = issues[i];
        issue.labels = issue.labels ? issue.labels.split(",") : [];
        var response = await post(`https://api.github.com/repos/${org}/${repo}/issues`, JSON.stringify(issue));
        if (response.statusCode >= 400) {
          grunt.fail.fatal(`Error: could not create issue "${issue.title}"`);
        }
        console.log(`...created ${i + 1} of ${issues.length}`)
        await wait(1000);
      }
      console.log("Issues created - have fun storming the castle!")
      done();
    });

  });

}
