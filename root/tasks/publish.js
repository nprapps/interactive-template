var async = require("async");
var fs = require("fs");
var path = require("path");
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
      async.each(uploads, function(upload, c) {
        var obj = {
          Bucket: bucketConfig.bucket,
          Key: join(bucketConfig.path, upload.path.replace(/^\\?build/, "")),
          Body: upload.buffer,
          ACL: "public-read",
          ContentType: mime.lookup(upload.path)
        };
        //console.log(obj), c();
        console.info("Uploading", obj.Key);
        s3.putObject(obj, c);
      }, function(err) {
        if (err) return console.log(err);
        console.log("All files uploaded successfully");
      })
    });
  });

}