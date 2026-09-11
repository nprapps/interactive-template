/*

Presets, applied once when a project is created.

A preset is a folder in the presets repo, and it can offer two things:

  <preset>/src/   copied into the project's src/
  <preset>        exports named hook functions, rendered into the
                  <%= t.presets("name") %> call sites in the project's src/

Both happen at grunt-init time, adding standardized source code to the project, which
can then be edited like any other part of the code.

Every configured preset's "header" hook is rendered into a
<%= t.presets("header") %> call site, in the order the presets were listed, so
several presets can contribute to one place in a file without knowing about
each other. Unused call sites disappear in the created project.

*/

var fs = require("fs");
var path = require("path");

//images, fonts and the like get copied, never scanned for call sites
var BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|eot|mp[34]|webm|mov|pdf|zip)$/i;

//<%= t.presets("header") %>, tolerating extra arguments and whitespace
var CALL = /<%=\s*t\.presets\(\s*["']([^"']+)["'][^)]*\)\s*%>/g;

//every file under dir, as paths relative to it
var walk = function(dir, prefix) {
  return fs.readdirSync(dir).reduce(function(found, entry) {
    var full = path.join(dir, entry);
    var rel = prefix ? prefix + "/" + entry : entry;
    return found.concat(fs.statSync(full).isDirectory() ? walk(full, rel) : [rel]);
  }, []);
};

//a preset that only ships files has no main entry point, and that's fine
var hooksIn = function(dir) {
  try {
    require.resolve(dir);
  } catch (err) {
    if (err.code == "MODULE_NOT_FOUND") return {};
    throw err;
  }
  return require(dir);
};

/*
Apply presets to the project in the current working directory.

  dirs  - absolute paths to preset folders, in the order they should layer
  props - the answers grunt-init collected, passed to every hook so a preset
          can use the project's name, author and so on

Returns a summary for the caller to report.
*/
exports.apply = function(dirs, props) {
  var summary = { copied: [], overwritten: [], rendered: [], unfilled: [] };
  var hooks = {};

  dirs.forEach(function(dir) {
    var label = path.basename(dir);

    //1. the files the preset owns, which become the project's files
    var from = path.join(dir, "src");
    if (fs.existsSync(from)) {
      walk(from).forEach(function(rel) {
        var dest = path.join("src", rel);
        //presets are applied in order, so a later one wins
        if (summary.copied.indexOf(dest) > -1) summary.overwritten.push(dest + " (by " + label + ")");
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(path.join(from, rel), dest);
        if (summary.copied.indexOf(dest) < 0) summary.copied.push(dest);
      });
    }

    //2. the markup it contributes, collected in preset order
    var exported = hooksIn(dir);
    Object.keys(exported).forEach(function(hook) {
      if (typeof exported[hook] != "function") return;
      (hooks[hook] = hooks[hook] || []).push(exported[hook]);
    });
  });

  //3. render every call site, including any in the files just copied in
  walk("src").forEach(function(rel) {
    if (BINARY.test(rel)) return;
    var file = path.join("src", rel);
    var input = fs.readFileSync(file, "utf8");
    var output = input.replace(CALL, function(match, hook) {
      if (!hooks[hook]) {
        summary.unfilled.push(hook + " in " + file);
        return "";
      }
      summary.rendered.push(hook + " in " + file);
      return hooks[hook].map(function(fn) { return fn(props) }).join("\n");
    });
    if (output != input) fs.writeFileSync(file, output);
  });

  return summary;
};
