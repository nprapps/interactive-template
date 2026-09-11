var exec = require("child_process").exec;
var fs = require("fs");
var os = require("os");
var path = require("path");
var presets = require("./presets");

exports.description = "A standard starting-point for news app development at NPR."
exports.template = function(grunt, init, done) {
  //prelims
  var here = path.basename(process.cwd());

  //Settings shared across an organization live in their own file rather than
  //in ~/.grunt-init/defaults.json, which every grunt-init template on the
  //machine reads. That keeps a key like "presets" from meaning something to
  //another template, and lets the file be handed out as-is without stepping
  //on defaults the user has already set.
  var shared = init.readDefaults("interactive-template-defaults.json");

  //An organization can keep all of its presets in a single repo, a folder
  //apiece, and name that repo here. npm can't install a subdirectory of a
  //repo, so the whole thing is installed as one package and the folders inside
  //it are the presets. It is installed only to be read: see presets.js, which
  //applies presets to src/ and leaves nothing of itself behind.
  var repo = shared.presetsRepo;

  //process
  init.process(init.defaults, [
    init.prompt("author_name"),
    init.prompt("app_name", here),
    init.prompt("app_description"),
    init.prompt("github_repo", "nprapps/" + here),
    {
      name: "presets",
      // set "presets" in ~/.grunt-init/interactive-template-defaults.json
      // to prepopulate this, and "presetsRepo" to install them from one repo
      message: repo
        ? "Presets to install (comma-separated folders in " + repo + ")"
        : "Presets to install (comma-separated npm modules)",
      default: shared.presets || "none"
    }
  ], function(err, props) {
    //add environment variables, dynamic properties

    //With a presets repo these answers are folders inside it; without one they
    //are npm install specs, which aren't always module names -- a git URL or a
    //local path installs fine but can't be resolved by that string. Either way
    //install first and let npm tell us what the modules are really called.
    var requested = String(props.presets || "").split(",").map(function(spec) {
      return spec.trim();
    }).filter(function(spec) {
      return spec && spec != "none";
    });

    //what npm has to fetch to get at the presets: one repo, or a package each
    var specs = repo && requested.length ? [repo] : requested;

    var root = init.filesToCopy(props);
    init.copyAndProcess(root, props, { noProcess: "src/assets/**" });
    grunt.file.mkdir("data");
    grunt.file.mkdir("src/assets/synced");

    //Applying presets is also what removes the <%= t.presets(...) %> call sites
    //from the source, so it has to happen on every path through this
    //function -- including the ones where there are no presets, or where
    //fetching them failed. A project left with call sites in it won't build.
    var finish = function(dirs, staging) {
      var summary = presets.apply(dirs, props);
      if (dirs.length) {
        summary.copied.forEach(function(file) { console.log("  + " + file); });
        summary.overwritten.forEach(function(file) { console.log("  ! overwritten: " + file); });
        summary.rendered.forEach(function(where) { console.log("  + " + where); });
        console.log("Applied presets: " + requested.join(", ") + ". They are ordinary files in src/ now - edit them freely.");
      }
      if (staging) fs.rmSync(staging, { recursive: true, force: true });
      done();
    };

    console.log("Installing Node modules...");
    exec("npm install", function(err, stdin, stderr) {
      if (err) console.error(stdin, stderr);
      if (!specs.length) return finish([]);

      //Presets are fetched into a throwaway directory, never installed into the
      //project. npm is only being used as the downloader here -- it already
      //understands registry names, git URLs and local paths -- and the project
      //should end up with no record of where its starting code came from. That
      //matters most for a private presets repo: nobody cloning this project
      //should need access to it in order to run npm install.
      var staging = fs.mkdtempSync(path.join(os.tmpdir(), "presets-"));
      console.log("Fetching presets...");
      exec("npm install --prefix " + staging + " " + specs.join(" "), function(err, stdin, stderr) {
        if (err) console.error(stdin, stderr);

        //whatever npm fetched, under the name that addresses it on disk
        var fetched = Object.keys(grunt.file.readJSON(path.join(staging, "package.json")).dependencies || {});
        if (!fetched.length) {
          console.error("Presets were requested but none were fetched - check the errors above.");
          return finish([], staging);
        }

        //With a repo, one package was fetched and the presets are folders in
        //it, in the order they were asked for. Otherwise each preset is a
        //package of its own, and npm records those alphabetically.
        var dirs = (repo ? requested.map(function(folder) {
          return path.join(fetched[0], folder);
        }) : fetched).map(function(request) {
          return path.join(staging, "node_modules", request);
        });

        var missing = dirs.filter(function(dir) { return !fs.existsSync(dir) });
        if (missing.length) {
          console.error("Not found in the presets repo: " + missing.map(function(dir) {
            return path.basename(dir);
          }).join(", "));
          console.error("Available: " + fs.readdirSync(path.join(staging, "node_modules", fetched[0])).join(", "));
          return finish([], staging);
        }

        finish(dirs, staging);
      });
    });
  });
};
