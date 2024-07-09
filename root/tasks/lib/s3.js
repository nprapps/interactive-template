/*

Async wrapper for S3

- upload and download functions
- ls lists files at a given bucket and path on s3

*/

var {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
  } = require("@aws-sdk/client-s3");
  var fs = require("fs");
  var mime = require("mime");
  var path = require("path");
  
  var region = process.env.AWS_DEFAULT_REGION || "us-east-1";
  var credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION || "us-east-1",
  };
  var s3 = new S3Client({ credentials, region });
  
  var upload = async function (object) {
    var result = await s3.send(new PutObjectCommand(object));
    return object.Key;
  };
  
  // object bodies are streams, we have to grab and combine them
  var captureStream = function (stream) {
    return new Promise((ok, fail) => {
      var chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", fail);
      stream.on("end", () => ok(Buffer.concat(chunks)));
    });
  };
  
  var download = async function (Bucket, Key) {
    var data = await s3.send(new GetObjectCommand({ Bucket, Key }));
    var buffer = await captureStream(data.Body);
    return buffer;
  };
  
  // get a single page of results from S3
  var getRemote = async function (Bucket, Prefix, Marker = null) {
    var results = await s3.send(
      new ListObjectsV2Command({ Bucket, Prefix, Marker })
    );
    var items = (results.Contents || [])
      .map(function (obj) {
        return {
          file: obj.Key.replace(/.*\/synced\//, ""),
          size: obj.Size,
          key: obj.Key,
          mtime: obj.LastModified,
        };
      })
      .filter((i) => i.size);
    var next = results.IsTruncated ? items[items.length - 1].key : null;
    return { items, next };
  };
  
  var ls = async function (bucket, path) {
    var response = null;
    var list = [];
    do {
      var marker = response && response.next;
      response = await getRemote(bucket, path, marker);
      list.push(...response.items);
    } while (response.next);
    return list;
  };
  
  module.exports = { upload, download, ls };