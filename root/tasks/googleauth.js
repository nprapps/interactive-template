var { google } = require("googleapis");
var chalk = require("chalk");

var http = require("http");
var os = require("os");
var path = require("path");
var url = require("url");

var tokenLocation = path.join(os.homedir(), ".google_oauth_token");

module.exports = function(grunt) {

  grunt.registerTask("google-auth", "Authenticates with Google for document download", function() {

    var done = this.async();

    var clientID = process.env.GOOGLE_OAUTH_CLIENT_ID;
    var secret = process.env.GOOGLE_OAUTH_CONSUMER_SECRET;

    var client = new google.auth.OAuth2(clientID, secret, "http://localhost:8000/authenticate/");
    google.options({ auth: client });

    var scopes = [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/spreadsheets.readonly"
    ];

    var authURL = client.generateAuthUrl({
      access_type: "offline",
      scope: scopes.join(" ")
    });

    var onRequest = function(request, response) {
      response.setHeader("Connection", "close");
      if (request.url.indexOf("authenticate") > -1) {
        onAuthenticated(request, response);
      } else if (request.url.indexOf("authorize") > -1) {
        response.setHeader("Location", authURL);
        response.writeHead(302);
        response.end();
      } else {
        response.writeHead(404);
        response.end();
      }
    };

    var onAuthenticated = async function(request, response) {
      var requestURL = request.url[0] == "/" ? "localhost:8000" + request.url : request.url;
      var query = new url.URL(requestURL).searchParams;
      var code = query.get("code");
      if (!code) return;
      try {
        var token = await client.getToken(code);
        var { access_token } = token.tokens;
        grunt.file.write(tokenLocation, access_token);
        response.end("Authenticated, saving token to your home directory");
      } catch (err) {
        response.end(err);
      }

      done();
    };

    var server = http.createServer(onRequest);
    server.listen(8000, () => console.log(`Please visit ${chalk.magenta("http://localhost:8000/authorize")} to authenticate`));

  });

}