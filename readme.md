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
  app.js - Optimized output based on AMD modules
  index.html - Template output
  style.css - Output from LESS files
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

How do I use this?
------------------

First, you'll need to install `grunt-init` and copy this repo to your `.grunt-
init` folder (see [the instructions here](http://gruntjs.com/project-
scaffolding#installing-templates) for help). Once it's installed, you can use
it to get up and running. Let's say you're starting a newsapp project. You
create a folder for it, open that folder up in your favorite shell, and run
the template:

```sh
grunt-init newsapp
```

The scaffolding will set up the folder and tasks for you. At that point, you
can simply run `grunt` to compile your resources, begin the watch task, and
start a local development server on port 8000.

Your entry points for development should be set up for you automatically.
These include:

- `/src/index.html` - This is the starting HTML template. You can set up others, if you want, but you'll need to add them to your build task.
- `/src/js/main.js` - Entry point for your application. By default, JavaScript is compiled as a set of AMD modules, so you should `require()` other code from this file to bootstrap the JavaScript portion of the app.
- `/src/css/seed.less` - Entry point for all CSS. You don't have to write all styles in this file: it's better to `@import` additional files from here, in order to organize your code.

Any CSV files located in `/csv` will be loaded and hung off the `csv` template
variable based on their filename. These files will be provided the same way as
Tarbell does: if they have a column named `key`, they'll be loaded onto an
object hash as that key, otherwise they'll be loaded as an array of objects.
For example, if we loaded CSV named `ceoData.csv` with the columns "name",
"company", and "salary", we could build a table with the following template
code:

```
<table>
  <thead>
    <tr>
      <th>Name
      <th>Company
      <th>Salary
  <tbody>
    <% csv.ceoData.forEach(function(ceo) { %>
    <tr>
      <td><%= ceo.name %>
      <td><%= ceo.company %>
      <td><%= ceo.salary %>
    <% }); %>
</table>
```

The build task also aliases `grunt.template` to `t`, which makes it easy to
call any template helper functions that you add there within the template.
Currently, the task includes helpers `t.formatNumber` and `t.formatMoney`.

If you need any additional JavaScript libraries, you should feel free to use
`bower install` to load them into the `/src/js/lib` folder. Once there, they
will be combined with your other files if you `require()` them from your
application JS, or you can set up a task to copy them over to the `/build`
folder (it's recommended to go the AMD route).