module.exports = function(grunt) {

  grunt.registerTask("auth", function() {

    var auth = {};
    try {
      auth = grunt.file.readJSON("./auth.json");
    } catch (e) {} //do nothing
    auth.s3 = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_DEFAULT_REGION || "us-west-1"
    };

    grunt.file.write("./auth.json", JSON.stringify(auth, null, 2));

  });

};
