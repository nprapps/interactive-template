var async = require("async");
var fs = require("fs");
var path = require("path");
var util = require("util");
var chalk = require("chalk");
var gzip = require("zlib").gzip;
var mime = require("mime");
var join = function() {
  return path.join.apply(path, arguments).replace(/\\/g, "/");
};

var aws = require("aws-sdk");

var formatSize = function(input) {
  if (input > 1024 * 1024) {
    return Math.round(input * 10 / (1024 * 1024)) / 10 + "MB";
  }
  if (input > 1024) {
    return Math.round(input / 1024) + "KB";
  }
  return input + "B";
};

var gzippable = ["js", "html", "json", "map", "css", "txt", "csv", "svg", "geojson"];

module.exports = function(grunt) {

  var config = require("../project.json");

  var findBuiltFiles = function() {
    var pattern = ["**/*"];
    var embargo = config.embargo;
    if (embargo) {
      if (!(embargo instanceof Array)) embargo = [embargo];
      embargo.forEach(function(item) {
        pattern.push("!" + item);
        console.log(chalk.bgRed.white("File embargoed: %s"), item);
      });
    }
    var files = grunt.file.expand({ cwd: "build", filter: "isFile" }, pattern);
    var list = files.map(function(file) {
      var buffer = fs.readFileSync(path.join("build", file));
      return {
        path: file,
        buffer: buffer
      };
    });
    return list;
  };

  grunt.registerTask("publish", "Pushes the build folder to S3", function(deploy) {

    var done = this.async();

    deploy = deploy || "stage";

    if (deploy == "live" && !config.production) {
      var checklist = grunt.file.read("tasks/checklist.txt");
      grunt.fail.fatal(checklist);
    }

    var bucketConfig = deploy != "simulated" ? config.s3[deploy] : {
      path: "SIMULATION"
    };
    //strip slashes for safety
    bucketConfig.path = bucketConfig.path.replace(/^\/|\/$/g, "");
    if (!bucketConfig.path) {
      grunt.fail.fatal("You must specify a destination path in your project.json.");
    }

    var creds = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_DEFAULT_REGION || "us-west-1"
    };
    if (!creds.accessKeyId) {
      grunt.fail.fatal("Missing AWS configuration variables.")
    }
    aws.config.update(creds);

    var s3 = new aws.S3();
    var uploads = findBuiltFiles();
    async.eachLimit(uploads, 10, function(upload, c) {

      async.waterfall([function(next) {
        //create the config object
        next(null, {
          Bucket: bucketConfig.bucket,
          Key: join(bucketConfig.path, upload.path.replace(/^\\?build/, "")),
          Body: upload.buffer,
          // ACL: "public-read",
          ContentType: mime.getType(upload.path),
          CacheControl: "public,max-age=300"
        });
      }, function(obj, next) {
        //check for GZIP support
        var extension = upload.path.split(".").pop();
        if (gzippable.indexOf(extension) == -1) return next(null, obj);
        // run compression
        return gzip(upload.buffer, function(err, zipped) {
          if (err) return next(err);
          obj.Body = zipped;
          obj.ContentEncoding = "gzip";
          next(null, obj);
        });
      }, function(obj, next) {
        var before = upload.buffer.length;
        var after = obj.Body.length;
        var compressed = obj.ContentEncoding == "gzip";
        var logString = compressed ? "... %s - %s %s %s (%s)" : "... %s - %s";
        var args = [logString, obj.Key, chalk.cyan(formatSize(before))];
        if (compressed) args.push(
          chalk.yellow("=>"),
          chalk.cyan(formatSize(after)),
          chalk.bold.green(Math.round(after / before * 100).toFixed(1) + "% via gzip")
        );
        console.log.apply(console, args);
        if (deploy != "simulated") s3.putObject(obj, next);
      }], c);
      
    }, function(err) {
      if (err) return console.log(err);
      console.log("All files uploaded successfully");
      done();
    });
  });

};
