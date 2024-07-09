var fs = require("fs");
var path = require("path");
var util = require("util");
var chalk = require("chalk");
var gzip = require("zlib").gzip;
var mime = require("mime");
var s3 = require("./lib/s3");

var join = (...parts) => path.join(...parts).replace(/\\/g, "/");
var formatSize = function (input) {
  if (input > 1024 * 1024) {
    return Math.round((input * 10) / (1024 * 1024)) / 10 + "MB";
  }
  if (input > 1024) {
    return Math.round(input / 1024) + "KB";
  }
  return input + "B";
};

var cut = (str, max) => {
  if (str.length > max) {
    var half = max / 2;
    return str.slice(0, half) + "..." + str.slice(-half);
  }
  return str;
};

var gzippable = [
  "js",
  "html",
  "json",
  "map",
  "css",
  "txt",
  "csv",
  "svg",
  "geojson",
];

var zip = function (buffer) {
  return new Promise((ok, fail) => {
    gzip(buffer, (err, result) => {
      if (err) return fail(err);
      ok(result);
    });
  });
};

module.exports = function (grunt) {
  var config = require("../project.json");

  var findBuiltFiles = function () {
    var pattern = ["**/*", "!assets/synced/**/*"];
    var embargo = config.embargo;
    if (embargo) {
      if (!(embargo instanceof Array)) embargo = [embargo];
      embargo.forEach(function (item) {
        pattern.push("!" + item);
        console.log(chalk.bgRed.white("File embargoed: %s"), item);
      });
    }
    var files = grunt.file.expand({ cwd: "build", filter: "isFile" }, pattern);
    var list = files.map(function (file) {
      var buffer = fs.readFileSync(path.join("build", file));
      return {
        path: file,
        buffer: buffer,
      };
    });
    return list;
  };

  grunt.registerTask(
    "publish",
    "Pushes the build folder to S3",
    function (deploy) {
      var done = this.async();
      deploy = deploy || "stage";

      if (deploy == "live" && !config.production) {
        var checklist = grunt.file.read("tasks/checklist.txt");
        grunt.fail.fatal(checklist);
      }

      var bucketConfig;
      switch (deploy) {
        case "simulated":
          bucketConfig = {
            path: "SIMULATION",
          };
          break;

        case "live":
          bucketConfig = config.s3.live;
          break;

        case "stage":
          bucketConfig = config.s3.stage;
          break;
      }

      //strip slashes for safety
      bucketConfig.path = bucketConfig.path.replace(/^\/|\/$/g, "");
      if (!bucketConfig.path) {
        grunt.fail.fatal(
          "You must specify a destination path in your project.json."
        );
      }

      var BATCH_SIZE = 10;

      var uploads = findBuiltFiles();

      var uploadProcess = async function () {
        for (var i = 0; i < uploads.length; i += BATCH_SIZE) {
          var batch = uploads.slice(i, i + BATCH_SIZE);

          var puts = batch.map(async function (upload) {
            var putObject = {
              Bucket: bucketConfig.bucket,
              Key: join(
                bucketConfig.path,
                upload.path.replace(/^\\?build/, "")
              ),
              Body: upload.buffer,
              ACL: "public-read",
              ContentType: mime.getType(upload.path),
              CacheControl: "public, max-age=120",
            };

            var isCompressed = false;
            var extension = upload.path.split(".").pop();
            if (gzippable.includes(extension)) {
              putObject.Body = await zip(upload.buffer);
              putObject.ContentEncoding = "gzip";
              isCompressed = true;
            }

            var before = upload.buffer.length;
            var after = putObject.Body.length;
            var logString = isCompressed ? "- %s - %s %s %s (%s)" : "- %s - %s";

            var abbreviated = putObject.Key.split("/")
              .map((w) => cut(w, 30))
              .join("/");

            var args = [logString, abbreviated, chalk.cyan(formatSize(before))];
            if (isCompressed) {
              args.push(
                chalk.yellow("=>"),
                chalk.cyan(formatSize(after)),
                chalk.bold.green(
                  Math.round((after / before) * 100).toFixed(1) + "% via gzip"
                )
              );
            }
            console.log(...args);
            if (deploy == "simulated") return;
            return s3.upload(putObject);
          });

          await Promise.all(puts);
        }
      };

      console.log("All files uploaded successfully");
      if (deploy == "stage" && config.production) {
        grunt.log.error(
          "CHECK YOURSELF: This project is marked as live, but you deployed to stage."
        );
      }
      uploadProcess().then(done);
    }
  );
};