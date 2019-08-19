# TODO

# Bugs

* Tabulator table does not render properly on page refresh (header row partly covered)
* Fix Find Error in JS console, when we add files to the view.
* favicon.ico not found on page load. What is this?
* Scroll bar in tabulator table: why and how?
* i for information does not work anymore.

# Refactoring

* Use the JSON search instead of the XML-RPC API: https://forum.opensubtitles.org/viewtopic.php?f=8&t=16453&start=15
* Rename everything that is named search to fetch
* Minify own Javascript
* See which parts of the static files we can delete to avoid bloating.
    * Restructure static files folder structure.
* Clean up CSS file
* Migrate to MySQL database.
* Really install batchsubs.py instead of symlinking it.
* Change logging for the way we do it in the or-framework

## Functional

* Only (and only be able to) select movie files (that OpenSubtitles accepts).
* Size of files in overview in MB
* Dynamically populate the languages selector
* Cut the index page up into a generic and content part.
* Make sure at least one language is selected.
* Proper config file (remove current config.py)
* 

## Cosmetics

* When we press the Fetch button, collapse the form (accordion)
* Rename 'search' to 'fetch'?

## Steps for production

* Change superuser password and email address.
* Serve static files properly. See: https://docs.djangoproject.com/en/2.1/howto/static-files/deployment/
* Use minified versions of Javascript libs.
* Web application security (Django tutorial)
    * Run HTTPS
* Test script loading (defer, async)

