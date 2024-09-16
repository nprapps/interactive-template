var path = require("path");
var fs = require("fs").promises;

var s3 = require("./lib/s3");
var project = require("../project.json");
var mime = require("mime");

module.exports = function (grunt) {
  var ls = async function (dir) {
    var stats = [];
    try {
      var matching = grunt.file.expand(
        { cwd: "./src/assets/synced", filter: "isFile" },
        ["**/*"]
      );
      // add modification of time and size
      for (var m of matching) {
        var s = await fs.stat(path.join(dir, m));
        stats.push({
          // handle Windows paths
          file: m.replace(/\\/g, "/"),
          size: s.size,
          mtime: s.mtime,
        });
      }
    } catch (err) {
      // on file failure, return whatever was left
      console.log(`Failed to read some files during sync`);
      console.error(err.message);
    }

    return stats;
  };

  var sync = async function (config, direction) {
    var location = path.posix.join(config.bucket, config.path);
    var remotePath = path.posix.join(config.path, "assets/synced");
    var localPath = "./src/assets/synced";

    var remoteFiles = await s3.ls(config.bucket, remotePath);
    var localFiles = await ls(localPath);

    var downloads = [];
    var uploads = [];

    // override if the push/pull flags are set
    if (direction) {
      if ((direction == "push")) {
        uploads = localFiles;
      } else {
        downloads = remoteFiles;
      }
    } else {
      // create lists to upload/download
      // default to all files that only exist in one place
      downloads = remoteFiles.filter((r) =>
        localFiles.every((l) => l.file != r.file)
      );
      uploads = localFiles.filter((l) =>
        remoteFiles.every((r) => r.file != l.file)
      );

      var common = remoteFiles.filter((r) =>
        localFiles.find((l) => l.file == r.file)
      );

      common.forEach(function (remote) {
        var local = localFiles.find((l) => l.file == remote.file);
        // check size first
        if (local.size == remote.size) return;
        // if they're different, sync the newer file across
        if (local.mtime > remote.mtime) {
          uploads.push(local);
        } else {
          downloads.push(remote);
        }
      });
    }

    console.log(
      `Sync status: ${downloads.length} to download, ${uploads.length} to upload`
    );

    if (!downloads.length && !uploads.length) {
      return console.log("No files needing sync");
    }

    // process downloads
    var downloadFile = async function (download) {
      console.log(`Downloading s3://${(config.bucket, download.key)}...`);
      var buffer = await s3.download(config.bucket, download.key);
      var location = path.join(localPath, download.file);
      var dirname = path.dirname(location);
      await fs.mkdir(dirname, { recursive: true });
      await fs.writeFile(path.join(localPath, download.file), buffer);
    };

    // batch the files
    for (var i = 0; i < downloads.length; i += 10) {
      var slice = downloads.slice(i, i + 10);
      await Promise.all(slice.map(downloadFile));
    }

    // process uploads
    var uploadFile = async function (upload) {
      console.log(`Uploading ${upload.file}...`);
      var buffer = await fs.readFile(path.join(localPath, upload.file));
      var object = {
        Bucket: config.bucket,
        Key: path.posix.join(remotePath, upload.file),
        Body: buffer,
        ACL: "public-read",
        ContentType: mime.getType(upload.file),
        CacheControl: "public,max-age=120",
      };
      await s3.upload(object);
    };

    for (var i = 0; i < uploads.length; i += 10) {
      var slice = uploads.slice(i, i + 10);
      await Promise.all(slice.map(uploadFile));
    }
  };

  // https://stackoverflow.com/questions/18623739/pass-options-to-a-grunt-task-while-running-it

  grunt.registerTask("sync", function (target = "stage") {
    var done = this.async();

    if (target == "live" && !project.production) {
      var checklist = grunt.file.read("tasks/checklist.txt");
      grunt.fail.fatal(checklist);
    } else {
      config = project.s3[target];
    }

    var options = grunt.option.keys();
    var direction = options.includes("push") ? "push" : options.includes("pull") ? "pull" : false;
    
    sync(config, direction).then(done);
  });
};