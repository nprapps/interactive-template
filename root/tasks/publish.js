var async = require("async");
var fs = require("fs");
var path = require("path");
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

var gzippable = ["js", "html", "json", "map", "css", "txt", "svg", "geojson"];

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

    if (deploy == "simulated") {
      var uploads = findBuiltFiles();
      async.each(uploads, function(upload, c) {
        var extension = upload.path.split(".").pop();
        if (gzippable.indexOf(extension) > -1) {
          gzip(upload.buffer, function(err, zipped) {
            console.log("Uploading gzipped %s - %s => %s",
              upload.path,
              formatSize(upload.buffer.length),
              formatSize(zipped.length)
            );
            c();
          })
        } else {
          console.log("Uploading %s", upload.path);
          c();
        }
      }, done);
      return;
    }

    if (deploy == "live" && !config.production) {
      var checklist = grunt.file.read("tasks/checklist.txt");
      grunt.fail.fatal(checklist);
    }

    var bucketConfig = config.s3[deploy];
    //strip slashes for safety
    bucketConfig.path = bucketConfig.path.replace(/^\/|\/$/g, "");

    var creds = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_DEFAULT_REGION
    };
    if (!creds.accessKeyId) {
      creds = require("../auth.json").s3;
    }
    aws.config.update(creds);

    var s3 = new aws.S3();
    s3.createBucket({
      Bucket: bucketConfig.bucket
    }, function(err) {
      if (err && err.code != "BucketAlreadyOwnedByYou") {
        return console.log(err);
      }
      var uploads = findBuiltFiles();
      async.eachLimit(uploads, 10, function(upload, c) {
        var obj = {
          Bucket: bucketConfig.bucket,
          Key: join(bucketConfig.path, upload.path.replace(/^\\?build/, "")),
          Body: upload.buffer,
          ACL: "public-read",
          ContentType: mime.lookup(upload.path),
          CacheControl: "public,max-age=3000"
        };
        //if this matches GZip support, compress them before uploading to S3
        var extension = upload.path.split(".").pop();
        if (gzippable.indexOf(extension) > -1) {
          var before = upload.buffer.length;
          return gzip(upload.buffer, function(err, zipped) {
            if (!err) {
              obj.Body = zipped;
              var after = zipped.length;
              obj.ContentEncoding = "gzip";
              console.log("Uploading gzipped %s - %s %s %s (%s)",
                obj.Key,

                chalk.cyan(formatSize(before)),
                chalk.yellow("=>"),
                chalk.cyan(formatSize(after)),
                chalk.bold.green(Math.round(after / before * 100) + "%")
              );
              s3.putObject(obj, c);
            }
          });
        }
        console.info("Uploading", obj.Key);
        s3.putObject(obj, c);
      }, function(err) {
        if (err) return console.log(err);
        console.log("All files uploaded successfully");
        done();
      });
    });
  });

};
