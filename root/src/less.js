/*
  less! plugin - requires Node build process, doesn't work in browser
*/

define(function() {
  if (typeof document !== "undefined" && typeof process == "undefined") {
    return {};
  }

  //for efficiency, piggyback on grunt-contrib-less
  var less = require.nodeRequire("less");
  var fs = require.nodeRequire("fs");
  var path = require.nodeRequire("path");

  var _ = function(tmp) {
    return tmp.toString().replace(/^.*\/\*\n*\s*|\*\/\}$/gm, "");
  };

  var lessTemplate = function() {/*
define("less!{{file}}", function() {
  var style = document.createElement("style");
  style.setAttribute("less", "{{file}}");
  style.innerHTML = {{content}};
  document.head.appendChild(style);
});
  */};

  var cache = {};

  return {
    load: function(name, req, onLoad, config) {
      var file = fs.readFileSync(path.join(config.baseUrl, name), { encoding: "utf8" });
      less.render(file, function(err, css) {
        cache[name] = css;
        onLoad(css);
      });
    },
    write: function(plugin, name, write) {
      var template = _(lessTemplate);
      var css = cache[name];
      var output = template
        .replace(/\{\{file\}\}/g, name)
        .replace("{{content}}", JSON.stringify(css));
      write(output);
    }
  };

});