Interactive Template
=====================

What is it?
-----------

This template for `grunt-init <http://gruntjs.com/project-scaffolding>`_
contains all the setup required to start building a flat-file news application.
Although it's a good starting place, providing reasonable defaults and data 
sources, it is not opinionated about front-end frameworks or overall 
application architecture. Out of the box, it provides:

- HTML templating using EJS with Markdown rendering
- JavaScript bundling using Browserify and Babel
- CSS compilation from LESS
- Live reload for all front-end tasks
- Data pipelines for loading:

  - Text from Google Docs
  - Structured data from Google Sheets or CSV
  - Automatic ArchieML parsing from text

- Deployment and asset synchronization with S3

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
local OAuth token before you can talk to the API. Once authenticated, the
easiest way to link a sheet to your project is to create it from the command
line task::

    grunt google-create --type=sheets --name="My Document Name"

This will generate the file in your Drive account and add its key to the
project configuration. You can also import existing sheets by their IDs: open
the ``project.json`` file and add your workbook key to the ``sheets`` array
found there.  Once the workbook key is set and you're authenticated, running
``grunt sheets`` will download the data from Google and cache it as JSON (one
file per worksheet). 

As with CSV, the data will be stored as an array unless one of your columns is
named "key," in which case it'll be stored as a hash table to each row object.
If there are only two columns named "key" and "value," it'll simplify that
structure by putting the value column directly into the lookup (i.e., you can
use ``sheet.key`` to get the value, instead of ``sheet.key.value``). You can
also append a type notation to your column name, separating it from the key
with a colon (e.g., "zipcode:text", "percapita:number", or "enabled:boolean").

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

If you need to pull in article text, we strongly recommend using
`ArchieML <http://archieml.org>`_ to load text and data chunks into your
regular HTML templates. Any file with a ``.txt`` extension in the ``data``
folder will be exposed as ``archieml.{filename}``. You can use Markdown
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

While Sheets are specified in ``project.json`` as an array, Docs should be set
as an object mapping filename to document ID::

    "docs": {
      "story": "id-string-here"
    }

This would cause your rig to download the document as ``story.docs.txt``, then
accessible for templating at ``grunt.data.archieml.story``.

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

These micro-modules cover most of the basic DOM manipulation that you would need
for a news apps, short of importing a full framework.

* ``debounce.js`` - Equivalent of Underscore's debounce()
* ``delegate.js`` - Equivalent of calling jQuery.on() with event delegation
* ``dom.js`` - Build HTML in JS, similar to React.createElement()
* ``dot.js`` - Compile client-side EJS templates with the same syntax used by the build system
* ``flip.js`` - Animate smoothly using `FLIP <https://aerotwist.com/blog/flip-your-animations/>`_
* ``qsa.js`` - Aliases for ``document.querySelectorAll()`` (as ``$``) and ``querySelector()`` (as ``$.one()``)
* ``tracking.js`` - Lets you fire custom events into GA for analytics

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

Publishing your work
--------------------

By default, this template can publish to S3. Two publication targets are set
in ``project.json``: stage and live. Running ``grunt publish`` will push
contents of the build folder to the staging bucket and path. To push to the
live bucket, you must first set ``production: true`` in your ``project.json``
file, then run ``grunt publish:live``. This is to protect against accidental
publication.

When you run ``grunt  publish``, it will read your AWS credentials from the
standard AWS  environment variables (``AWS_ACCESS_KEY_ID`` and 
``AWS_SECRET_ACCESS_KEY``). You must have these variables set before
publication. You should also make sure  your files have been rebuilt first,
either by running the default task  or by running the ``static`` task (``grunt
static publish`` will do  both).

Thinking about tasks
---------------------

All of the above processes--templating, compiling styles and JavaScript, and
running the development server--are included in the default build task. This
process is composed out of smaller tasks, some of which in turn are themselves
composites of smaller units of work. We organize them in the ``Gruntfile.js``
file, but all code should be written and loaded from the ``tasks`` folder.

Conceptually, applications built on this template are organized around the
idea that we take inputs from various locations (``src``, ``data``, or a
remote API) and produce a static set of files in ``build``. Whenever possible,
these tasks are largely stateless: they do not retain or re-use information
between runs.

The default tasks currently defined by the rig are:

-  ``archieml`` - Load text files onto ``grunt.data.archieml``
-  ``build`` - Process HTML templates
-  ``bundle`` - Compile JS into the app.js file
-  ``clean`` - Delete the build folder to start again from scratch
-  ``connect`` - Start the dev server
-  ``copy`` - Copy all assets over to the build folder
-  ``cron`` - Run a series of build tasks at regular intervals (for automated publishing, like election results)
-  ``csv`` - Load CSV files onto ``grunt.data.csv``
-  ``docs`` - Download Google Docs and save as .txt
-  ``google-auth`` - Authorize against the Drive API for downloading private files from Google, such as Docs and Sheets files.
-  ``google-create`` - Create a Google Drive file and link it into the project config
-  ``issues`` - Create a default set of GitHub issues in a project repo, as defined in ``issues.csv``
-  ``json`` - Load JSON files onto ``grunt.data.json``
-  ``less`` - Compile LESS files into CSS
-  ``publish`` - Push files to S3 or other endpoints
-  ``sheets`` - Download data from Google Sheets and save as JSON files
-  ``static`` - Run all generation tasks, but do not start the watches or dev server
-  ``sync`` - Synchronize gitignored assets in ``src/assets/synced`` with the S3 bucket
-  ``systemd`` - Generate a SystemD service file for running the build process automatically
-  ``template`` - Load data files and process HTML templates
-  ``watch`` - Watch various directories and perform partial builds when they change

Knowing that these tasks are composable, we can use it to perform selective
operations, not just full builds. 

For example, a common problem is to quickly hotfix the JavaScript bundle for a
project. To do this, we want to clear out the contents of the build folder,
assemble just the JS scripts, and then publish it. So we might run ``grunt
clean bundle publish:live``.

Similarly, let's say we just want to update the HTML for a project with fresh
edits from Google, but not take the time to build or upload scripts, assets,
and styles. We'll want to use the "template" meta-task, defined in the
Gruntfile, which loads all our data and runs the ``build`` task to generate
HTML against it. So for this, we might run ``grunt docs sheets clean template
publish:live``.

Finally, on some projects, it may make sense to define a validation step that
checks data for integrity before continuing the build process (example: `our
liveblog rig 
<https://github.com/nprapps/liveblog-standalone/blob/master/tasks/validate.js>`_).
By creating this task and then adding it to the "content" meta-task, it will
run every time the template loads. Then we can run ``grunt docs sheets
content`` to load and validate fresh data, without needing to start the entire
rig or run all of the other things it can do.

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


Technicalities
--------------

This template is licensed under the MIT License, so you are free to do
whatever you want with it. If you update or improve the Grunt tasks contained
inside, we'd love to hear from you.

By default, the projects generated by this template are licensed under the
GPLv3, and we whole-heartedly recommend its usage. However, given that the
template itself is MIT-licensed, you are free to replace ``root/license.txt``
with the legal text of your choice, or remove it entirely.
