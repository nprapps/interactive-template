var { google } = require("googleapis");
var async = require("async");
var os = require("os");
var path = require("path");
var { authenticate } = require("./googleauth");

module.exports = function(grunt) {
  grunt.registerTask(
    "docs",
    "Load Google Docs into the data folder",
    function() {
      var config = grunt.file.readJSON("project.json");
      var auth = null;
      try {
        auth = authenticate();
      } catch (err) {
        console.log(err);
        return grunt.fail.warn(
          "Couldn't load access token for Docs, try running `grunt google-auth`"
        );
      }

      var done = this.async();

      var docs = google.docs({ auth, version: "v1" }).documents;

      var formatters = {
        link: (text, style) => `<a href="${style.link.url}">${text}</a>`,
        bold: text => `<b>${text}</b>`,
        italic: text => `<i>${text}</i>`
      };

      /*
       * Large document sets may hit rate limits; you can find details on your quota at:
       * https://console.developers.google.com/apis/api/drive.googleapis.com/quotas?project=<project>
       * where <project> is the project you authenticated with using `grunt google-auth`
       */
      async.eachLimit(
        Object.keys(config.docs),
        2, // adjust this up or down based on rate limiting
        async function(key) {
          var documentId = config.docs[key];
          var suggestionsViewMode = "PREVIEW_WITHOUT_SUGGESTIONS";
          var docResponse = await docs.get({ documentId, suggestionsViewMode });
          var name = key + ".docs.txt";
          var body = docResponse.data.body.content;
          var text = "";

          var lists = docResponse.data.lists;

          body.forEach(function(block) {
            if (!block.paragraph) return;
            if (block.paragraph.bullet) {
              var list = lists[block.paragraph.bullet.listId];
              var level = block.paragraph.bullet.nestingLevel || 0;
              var style = list.listProperties.nestingLevels[level];
              var bullet = "- ";
              if (style) {
                if (style.glyphType == "DECIMAL") {
                  bullet = "1. ";
                }
              }
              var indent = "  ".repeat(level);
              text += indent + bullet;
            }
            block.paragraph.elements.forEach(function(element) {
              // console.log(element);
              if (!element.textRun) return;
              var { content, textStyle } = element.textRun;
              if (content.trim())
                for (var f in formatters) {
                  if (textStyle[f]) {
                    var [_, before, inside, after] = content.match(
                      /^(\s*)(.*?)(\s*)$/
                    );
                    content = before + formatters[f](inside, textStyle) + after;
                  }
                }
              text += content;
            });
          });

          text = text.replace(/\x0b/g, "\n");

          console.log(`Writing document as data/${name}`);
          grunt.file.write(path.join("data", name), text);
        },
        function(err) {
          if (err) {
            console.log("Uncaught error in docs:");
            console.log(err);
          }
          done();
        }
      );
    }
  );
};
