Interactive Template
=====================

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
news app or interactive graphic.

Installation
------------

Before you begin, you'll need to have the following installed:

-  NodeJS/NPM
-  The Grunt command line utility (grunt-cli, installed globally)
-  Grunt project scaffolding (grunt-init, installed globally)

Find (or create) the ``.grunt-init`` folder in your user's home folder and
clone this repo into it using the following command:

.. code:: sh

    git clone git@github.com:nprapps/interactive-template interactive

(We want to clone into the "interactive" folder so that we can run
``grunt-init interactive`` and not ``grunt-init interactive-template``.
``grunt-init`` uses the name of the folder as the name of the template to init.)

If it works, you should be able to ``ls ~/.grunt-init/interactive`` and get back a
list of files. That's it! Now let's start a sample project to see how it all
works.

Getting Started
---------------

For our first project, we'll do something pretty simple. Open a terminal,
make a new folder for your project, and run ``grunt-init``:

.. code:: sh

    cd ~
    mkdir example-app
    cd example-app
    grunt-init interactive

The scaffolding wizard will ask you to fill in some information, such as
your name, the name of the project, a description. Once that's done,
it'll set up some folders and source files for you in the current directory
(the one seen in the output of ``pwd``), and install the NPM
modules needed for this project. After ``grunt-init`` hands you back to the prompt,
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
to the project) are processed using Grunt's built-in
`Lo-dash templating <https://gruntjs.com/api/grunt.template>`_
(HTML files starting with an ``_`` will be ignored). If you have any CSV
files located in your ``data`` directory, these will be parsed and made
available to your templates via the ``csv`` object (likewise, JSON files
in the ``data`` directory will be loaded to the ``json`` object, keyed
by their filename). For example, maybe you have a CSV file located at
``data/ceoData.csv`` containing columns of data named "company", "name",
"age", "gender", and "salary". We could write the following template in
our ``index.html`` file to output this as an HTML table::

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

In addition to on-disk data, you can set the template to import data from
Google Sheets. This is a great option for collaborating with other newsroom
staff, who may find Google Drive easier than Excel (especially when it comes
to sharing files). You'll also need to run ``grunt google-auth`` to create a
local OAuth token before you can talk to the API. One authenticated, the
easiest way to link a sheet to your project is to create it from the command
line task::

    grunt google-create --type=sheets --name="My Document Name"

This will generate the file in your Drive account and add its key to the
project configuration. You can also import existing sheets by their IDs: open
the ``project.json`` file and add your workbook key to the ``sheets`` array
found there.  Once the workbook key is set and you're authenticated, running
``grunt sheets`` will download the data from Google and cache it as JSON (one
file per worksheet). As with CSV, the data will be stored as an array unless
one of your columns is named "key," in which case it'll be stored as a hash
table.

When placing data into your HTML via Lo-dash, there are some helper
functions that are also made available via ``t``, as seen above with
``t.formatMoney()``. These are defined in ``tasks/build.js``, but you
should feel free to add your own. One that may prove useful is
``t.include()``, which will import another file into the template for
processing. For example, we might import a header and footer with the
following template::

    <%= t.include("partials/_head.html") %>
    This space intentionally left blank.
    <%= t.include("partials/_foot.html") %>

You can also pass data to an included template file using the second argument
to ``t.include()``, like so::

    <%= t.include("partials/_ad.html", { type: "banner" }) %>

This will load our ad block, sized for a "banner" slot (other common slots are "square" and "tall"). We include a number of partials as useful building blocks.

If you need to pull in article text, you can do so easily by placing a
Markdown file with a ``.md`` extension in the project folder. These files will
be treated as an `EJS-like template <http://lodash.com/docs/#template>`_ the
same as HTML, so you can mix in data and generate code inline. However, rather
than embedding HTML templates into your content, we strongly recommend using
`ArchieML <http://archieml.org>`_ to load text and data chunks into your
regular HTML templates. Any file with a ``.txt`` extension in the ``data``
folder will be exposed as ``archieml.{filename}``. You can still use Markdown
syntax in ArchieML files by using the ``t.renderMarkdown()`` function in your
templates to process content::

    <main class="article">
      <%= t.renderMarkdown(archieml.story.intro) %>
    </main>

The template also includes a task (``docs``) for downloading Google Docs, much
the same way as Sheets, and the ``google-create`` task can be used to
automatically create/link them if you specify ``--type=docs``. They'll be
cached as ``.docs.txt`` in the data folder, and then loaded as ArchieML.

Access to Docs requires your machine to have a
Google OAuth token, which is largely the same as described in `this post
<http://blog.apps.npr.org/2015/03/02/app-template-oauth.html>`_.
You can obtain a token by running ``grunt google-auth``.

Client-side Code
----------------

Let's install Leaflet and add it to our JavaScript bundle. From the
project folder, run the following command:

.. code:: sh

    npm install leaflet --save

Now we'll change ``src/js/main.js`` to load Leaflet:

.. code:: javascript

    var L = require("leaflet"); //load Leaflet from an NPM module
    console.log(L);

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

Typically, you shouldn't need to load jQuery on a project, because these
micro-modules cover most of its functionality, as well as some additional
useful tools:

* ``animateScroll.js`` - Scroll to an element with a nice transition
* ``closest.js`` - Equivalent of jQuery.closest()
* ``debounce.js`` - Equivalent of Underscore's debounce()
* ``delegate.js`` - Equivalent of calling jQuery.on() with event delegation
* ``dom.js`` - Build HTML in JS, similar to React.createElement()
* ``dot.js`` - Compile client-side EJS templates with the same syntax used by the build system
* ``flip.js`` - Animate smoothly using `FLIP <https://aerotwist.com/blog/flip-your-animations/>`_
* ``prefixed.js`` - Used to access prefixed features in other browsers (mostly used by other modules)
* ``pym.js`` - Initializes this page as a Pym child
* ``qsa.js`` - Equivalent to jQuery's DOM search functions
* ``tracking.js`` - Lets you fire custom events into GA for analytics
* ``xhr.js`` - Equivalent to jQuery.ajax()

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

-  ``archieml`` - Load text files onto ``grunt.data.archieml``
-  ``auth`` - Create an ``auth.json`` file from the AWS environment variables
-  ``bundle`` - Compile JS into the app.js file
-  ``clean`` - Delete the build folder to start again from scratch
-  ``connect`` - Start the dev server
-  ``copy`` - Copy all assets over to the build folder
-  ``csv`` - Load CSV files onto ``grunt.data.csv``
-  ``docs`` - Download Google Docs and save as .txt
-  ``google-auth`` - Authorize against the Drive API for downloading private files from Google, such as Docs and Sheets files.
-  ``google-create`` - Create a Google Drive file and link it into the project config
-  ``json`` - Load JSON files onto ``grunt.data.json``
-  ``less`` - Compile LESS files into CSS
-  ``markdown`` - Load Markdown files onto ``grunt.data.markdown``
-  ``publish`` - Push files to S3 or other endpoints
-  ``sheets`` - Download data from Google Sheets and save as JSON files
-  ``static`` - Run all generation tasks, but do not start the watches or dev server
-  ``template`` - Load data files and process HTML templates
-  ``watch`` - Watch various directories and perform partial builds when they change

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
    ├── data - folder for all JSON/CSV/ArchieML data files
    ├── Gruntfile.js
    ├── package.json - Node dependencies and metadata
    ├── project.json - various project configuration
    ├── src
    │   ├── assets - files will be automatically copied to /build/assets
    │   ├── css - LESS files
    │   ├── index.html
    │   ├── partials - directory containing boilerplate template sections
    │   └── js
    │       ├── main.js
    │       └── lib - directory for useful micro-modules
    └── tasks - All Grunt tasks

How do I extend the template?
-----------------------------

The interactive template is just a starting place for projects, and should
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

This template is licensed under the MIT License, so you are free to do
whatever you want with it. If you update or improve the Grunt tasks contained
inside, we'd love to hear from you.

By default, the projects generated by this template are licensed under the
GPLv3, and we whole-heartedly recommend its usage. However, given that the
template itself is MIT-licensed, you are free to replace ``root/license.txt``
with the legal text of your choice, or remove it entirely.
