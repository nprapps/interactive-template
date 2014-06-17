Seattle Times News App Template
===============================

This template for [grunt-init](http://gruntjs.com/project-scaffolding)
contains all the setup required to start building a flat-file news application
(It may be useful for dynamic apps as well). The goal is to have a set of
sensible defaults and automatic tasks similar to those provided by
[Tarbell](http://tarbell.tribapps.com/), but optimized for a NodeJS workflow.
The resulting folder layout is as follows:

```
/src
  /css - Styles as LESS files
    seed.less - Pre-configured LESS source
  /js
    main.js - Starting point for JavaScript
  /lib - Bower components automatically install here
  index.html - Entry point for the app
/csv - CSV files placed here will be made available on `grunt.data` during builds
/tasks - Grunt tasks (see below)
/build - All built files
project.json - Contains project-specific configuration, such as deployment locations
auth.json - Sensitive information like AWS keys, which will not be checked in to Git
.gitignore
.bowerrc
package.json
Gruntfile.js
```

The app template also creates the following Grunt tasks for your convenience:

- `template` - Process src/index.html as a template, using `grunt.data` as the source
- `loadCSV` - Load any CSVs onto `grunt.data.csv`
- `loadSheet` - Load tabular data from a Google Sheet onto `grunt.data`
- `publish` - Push the files to staging on S3 (use `publish:live` to go to the final destination)
- `connect` - Start a Connect server based in the /build directory
- `less` - Compile LESS files into the /build/style.css
- `watch` - Trigger individual build tasks when files change
- `amd` - Build src/js/main.js into build/app.js

Extra documentation for each task is available in its source file. By default,
running `grunt` or `grunt default` will start a dev server, rebuild all files,
and start a watch task for development.
