Seattle Times News App Template
===============================

What is it?
-----------

This template for `grunt-init <http://gruntjs.com/project-scaffolding>`_
contains all the setup required to start building a flat-file news application
(It may be useful for dynamic apps as well). The goal is to have a set of
sensible defaults and automatic tasks similar to those provided by `Tarbell
<http://tarbell.tribapps.com/>`_, but optimized for a NodeJS workflow. Among
other things, app built on this scaffolding will automatically parse CSV and
JSON for your HTML templates, import data from Google Drive, build LESS into
CSS, browserify JavaScript from CommonJS modules, and set up a local
development server with watch tasks and live reload to make rapid development
easy as pie.

*Executive summary:* Provides everything you need to start building a
news app for the Seattle Times (or anywhere else).

Installation
------------

Before you begin, you'll need to have the following installed:

-  NodeJS/NPM
-  The Grunt command line utility (grunt-cli, installed globally)
-  Grunt project scaffolding (grunt-init, installed globally)

Find (or create) the ``.grunt-init`` folder in your user's home folder and
clone this repo into it using the following command:

.. code:: sh

    git clone git@github.com:seattletimes/newsapp-template newsapp

(We want to clone into the "newsapp" folder so that we can run
``grunt-init newsapp`` and not ``grunt-init newsapp-template``.)

If it works, you should be able to ``ls ~/.grunt-init/newsapp`` and get back a
list of files. That's it! Now let's start a sample project to see how it all
works.

Getting Started
---------------

For our first project, we'll do something pretty simple. Make a new
folder for your project, open a shell there, and type:

.. code:: sh

    grunt-init newsapp

The scaffolding wizard will ask you to fill in some information, such as
your name, the name of the project, a description. Once that's done,
it'll set up some folders and source files for you, and install the NPM
modules needed for this project. After it hands you back to the prompt,
type ``grunt`` at the command line to compile the project and start a
local development server at ``http://localhost:8000``.

This is all well and good, but the page itself isn't very exciting at
the start, because there's nothing in it. There are three default files
that are created for you to start your project:

-  ``/src/index.html`` - The primary HTML file for the project
-  ``/src/js/main.js`` - The entry point for all JavaScript on the page
-  ``/src/css/seed.less`` - The bootstrap file for LESS compilation into
   CSS

If you open up ``src/index.html``, and edit it while Grunt is running, the
watch task will see your changes and re-run the relevant task. Likewise,
editing ``seed.less`` (or any other LESS file in the ``src/css`` directory)
will cause the LESS compiler to recompile your CSS, and editing any JavaScript
files in the ``src/js`` file will cause the browserify to rebuild
``/build/app.js`` based on your  dependencies from ``src/js/main.js``. These
changes are baked out into the ``build`` folder for publishing, but also
served up via the local development server on port 8000.

Data and Templating
-------------------

The ``index.html`` template (and any other templates you choose to add
to the project) are processed using Grunt's built in Lo-dash templating
(HTML files starting with an ``_`` will be ignored). If you have any CSV
files located in your ``data`` directory, these will be parsed and made
available to your templates via the ``csv`` object (likewise, JSON files
in the ``data`` directory will be loaded to the ``json`` object, keyed
by their filename). For example, maybe you have a CSV file located at
``data/ceoData.csv`` containing columns of data named "company", "name",
"age", "gender", and "salary". We could write the following template in
our ``index.html`` file to output this as an HTML table:

::

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
          <td><%= t.formatMoney(ceo.salary) %>
        <% }); %>
    </table>

In addition to on-disk data, you can set the template to import data
from Google Sheets. This is a great option for collaborating with other
newsroom staff, who may find Google Drive easier than Excel (especially
when it comes to sharing files). To configure your project for import,
open the ``project.json`` file and add your workbook key to the
``sheets`` array found there. You'll also need to use the "Publish to
Web" menu item in the Sheets UI (under file) to open up API access. Once
both of those conditions are met, running ``grunt sheets`` will download
the data from Google and cache it as JSON (one file per worksheet). As
with CSV, the data will be stored as an array unless one of your columns
is named "key," in which case it'll be stored as a hash table.

When placing data into your HTML via Lo-dash, there are some helper
functions that are also made available via ``t``, as seen above with
``t.formatMoney()``. These are defined in ``tasks/build.js``, but you
should feel free to add your own. One that may prove useful is
``t.include()``, which will import another file into the template for
processing. For example, we might import a header and footer with the
following template:

::

    <%= t.include("partials/_head.html") %>
    This space intentionally left blank.
    <%= t.include("partials/_foot.html") %>

You can also pass data to an included template file using the second argument
to ``t.include()``, like so:

::

    <%= t.include("partials/_ad.html", { type: "banner" }) %>

This will load our ad block, sized for a "banner" slot (other common slots are "square" and "tall"). We include a number of partials as useful building blocks for Seattle Times content, such as:

* ``_ad.html`` - inserts standard ads (same as the site) with lazy-loading code. Specify the type and an optional ID for styling
* ``_comments.html`` - loads LiveFyre comments. Specify the LF application ID with ``article``.
* ``_dontMiss.html`` - Creates the "Don't miss" quads. The ``data`` property should be an array of objects with ``head``, ``category``, ``image``, and ``link`` properties.
* ``_gallery.html`` - a re-implementation of the main site's scrolling gallery code.
* ``_nav.html`` and ``_navBottom.html`` - The top and bottom Seattle Times nav bars, with built-in share widget

Client-side Code
----------------

Let's install jQuery and add it to our JavaScript bundle. From the
project folder, run the following command:

.. code:: sh

    npm install jquery --save

Now we'll change ``src/js/main.js`` to load jQuery:

.. code:: javascript

    var $ = require("jquery"); //load jQuery from an NPM module
    console.log($);

When we restart our dev server by running the ``grunt`` command, the
``bundle`` task will scan the dependencies it finds, starting in
``src/js/main.js``, and build those into a single file at ``build/app.js``
(which is already included in the default HTML template). 

The template also includes a number of smaller helper modules that we didn't
think were important enough to publish to NPM. You can always load these
modules with the relative path:

.. code:: javascript

    //this enables social widgets and ad code
    //no return value is needed
    require("./lib/social");
    require("./lib/ads");

    //load our animated scroll and FLIP animation helpers for use
    var animateScroll = require("./lib/animateScroll");
    var flip = require("./lib/flip");

Browserify plugins for loading text files (with extensions ``.txt`` and
``.html``) and LESS files (for creating web components) are included with the
template, so you can also just ``require()`` those files the same way you
would other local modules. We often use this for our client-side templating:

.. code:: javascript

    //load the templating library preset
    var dot = require("./lib/dot");

    //get the template source and compile it
    var template = dot.compile( require("./_tmpl.html") );

In a similar fashion, to add more CSS to our project, we would create a new
LESS file in ``src/css``, then update our ``src/css/seed.less`` file to import
it like so:

.. code:: less

    @import "variables"; //import src/css/variables.less
    @import "base"; //import src/css/base.less
    @import "project"; //import src/css/project.less

From this point, we can continue adding new HTML templates, new
JavaScript files, and new LESS imports, just by following these
conventions. Our page will be regenerated as we make changes as long as
the default Grunt task is running, and the built-in live reload server
will even refresh the page for us!

Note that both the LESS and JS bundle tasks are designed to be easily
extensible: if you need to output multiple bundles for separate pages (such as
a primary page and a secondary embedded widget), you can add new seeds to
these files relatively easily, and then share code between both bundles.

What else does it do?
---------------------

The default Grunt task built into the template will run all the build
processes, start the dev server, and set up watches for the various
source files. Of course, you can also run these as individual tasks,
including some tasks that do not run as a part of the normal build.
Remember that you can use ``grunt --help`` to list all tasks included in
the project.

-  ``csv`` - Load CSV files into the ``grunt.data.csv`` object for
   templating
-  ``json`` - Load JSON files onto ``grunt.data.json``
-  ``sheets`` - Download data from Google Sheets and save as JSON files
-  ``template`` - Load data files and process HTML templates
-  ``less`` - Compile LESS files into CSS
-  ``bundle`` - Compile JS into the app.js file
-  ``publish`` - Push files to S3 or other endpoints
-  ``auth`` - Create an ``auth.json`` file from the AWS environment 
   variables
-  ``connect`` - Start the dev server
-  ``watch`` - Watch various directories and perform partial builds when
   they change
-  ``static`` - Run all generation tasks, but do not start the watches
   or dev server

The publish task deserves a little more attention. When you run ``grunt 
publish``, it will read your AWS credentials from the standard AWS 
environment variables (``AWS_ACCESS_KEY_ID`` and 
``AWS_SECRET_ACCESS_KEY``), falling back on keys found in ``auth.json`` 
(useful for Windows users without admin access). The bucket 
configuration is loaded from ``project.json``. The task will then push 
the contents of the ``build`` folder up to the stage bucket. If you want 
to publish to live, you should run ``grunt publish:live``. Make sure 
your files have been rebuilt first, either by running the default task 
or by running the ``static`` task (``grunt static publish`` will do 
both).

Where does everything go?
-------------------------

::

    ├── auth.json - authentication information for S3 and other endpoints
    ├── build - generated, not checked in or included before the first build
    │   ├── assets
    │   ├── app.js
    │   ├── index.html
    │   └── style.css
    ├── data - folder for all JSON/CSV data files
    ├── Gruntfile.js
    ├── package.json - Node dependencies and metadata
    ├── project.json - various project configuration
    ├── src
    │   ├── assets - files will be automatically copied to /build
    │   ├── css
    │   │   └── seed.less
    │   ├── index.html
    │   ├── partials - directory containing Seattle Times boilerplate
    │   └── js
    │       ├── main.js
    │       └── lib - directory for Bower, ST site modules
    └── tasks - All Grunt tasks
        ├── build.js
        ├── bundle.js
        ├── checklist.txt
        ├── clean.js
        ├── connect.js
        ├── copyAssets.js
        ├── cron.js
        ├── less.js
        ├── loadCSV.js
        ├── loadJSON.js
        ├── loadSheets.js
        ├── markdown.js
        ├── publish.js
        ├── state.js
        └── watch.js

How do I extend the template?
-----------------------------

The news app template is just a starting place for projects, and should
not be seen as a complete end-to-end solution. As you work on a project,
you may need to extend it with tasks to do specialized build steps, copy
extra files, or load network resources. Here are a few tips on how to go
about extending the scaffolding on a per-project basis:

-  Any .js files located in ``tasks`` will be loaded automatically by
   Grunt. Try to keep new tasks relatively self-contained, instead of
   ending up with a sprawling Gruntfile. Each task can add its own
   config to the overall configuration with ``grunt.config.merge``, as
   the existing tasks do.
-  As with Tarbell, CSV files can be loaded in one of two ways. By
   default, they will use the columns as the keys, and appear to the
   HTML template as an array of objects. However, if one of your columns
   is named "key", the result will be an object mapping the key value to
   the row data. This is useful for localization, among other purposes.
-  The setup process will install the
   `ShellJS <https://github.com/arturadib/shelljs>`_ module in your
   project, which is used by several of the built-in tasks for file
   management and setup. In addition to UNIX file operations like ``cp``
   and ``mv``, ShellJS also provides cross-platform implementations of
   ``sed``, ``grep``, and ``ln``, as well as easy access to environment
   variables. Using ShellJS means you don't have to resort to Bash
   scripting for basic ``make``-like tasks.

Technicalities
--------------

This template is licensed under the MIT License, so you are free to do whatever you want with it. If you update or improve the Grunt tasks contained inside, we'd love to hear from you.

By default, the projects generated by this template are licensed under the GPLv3, and we whole-heartedly recommend its usage. However, given that the template itself is MIT-licensed, you are free to replace ``root/license.txt`` with the legal text of your choice, or remove it entirely.