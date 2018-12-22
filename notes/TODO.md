# TODO

# Bugs

* Tabulator table does not render properly on page refresh (header row partly covered)
* Fix Find Error in JS console, when we add files to the view.
* favicon.ico not found on page load. What is this?
* Scroll bar in tabulator table: why and how?

# Refactoring

* Minify own Javascript
* See which parts of the static files we can delete to avoid bloating.
    * Restructure static files folder structure.
* Clean up CSS file
* Migrate to MySQL database.

## Functional

* Only (and only be able to) select movie files (that OpenSubtitles accepts).
* Size of files in overview in MB
* Dynamically populate the languages selector
* Cut the index page up into a generic and content part.
* Make sure at least one language is selected.

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