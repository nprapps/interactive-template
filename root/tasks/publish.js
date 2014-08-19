var async = require("async");
var fs = require("fs");
var path = require("path");
var chalk = require("chalk");
var gzip = require("zlib").gzip;
var mime = require("mime");
var join = function() {
  return path.join.apply(path, arguments).replace(/\\/g, "/");
}

var aws = require("aws-sdk");
var walk = function(dir) {
  var list = [];
  var files = fs.readdirSync(dir);
  files.forEach(function(f) {
    f = join(dir, f);
    var stat = fs.statSync(f);
    if (stat.isDirectory()) {
      list.push.apply(list, walk(f));
    } else {
      var buffer = fs.readFileSync(f);
      list.push({
        path: f,
        buffer: buffer
      });
    }
  });
  return list;
};

var formatSize = function(input) {
  if (input > 1024 * 1024) {
    return Math.round(input * 10 / (1024 * 1024)) / 10 + "MB";
  }
  if (input > 1024) {
    return Math.round(input / 1024) + "KB";
  }
  return input + "B";
}

module.exports = function(grunt) {

  var creds = require("../auth.json");
  var config = require("../project.json");

  grunt.config.merge({
    publish: config.s3
  });

  grunt.registerTask("publish", "Pushes the build folder to S3", function(deploy) {

    deploy = deploy || "stage";
    var c = this.async();

    var bucketConfig = config.s3[deploy];
    aws.config.update(creds.s3);

    var s3 = new aws.S3();
    s3.createBucket({
      Bucket: bucketConfig.bucket
    }, function(err) {
      if (err && err.code != "BucketAlreadyOwnedByYou") {
        return console.log(err);
      }
      var uploads = walk("./build");
      var gzippable = ["js", "html", "json", "map", "css", "txt"];
      async.each(uploads, function(upload, c) {
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
                upload.path,

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
      })
    });
  });

}