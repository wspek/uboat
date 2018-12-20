# TODO

* Cut the index page up into a generic and content part.
* Size of files in overview in MB
* Only (and only be able to) select movie files (that OpenSubtitles accepts).
* See which parts of the static files we can delete to avoid bloating.
    * Restructure static files folder structure.
* Move to MySQL database.

## Steps for production

* Change superuser password and email address.
* Serve static files properly. See: https://docs.djangoproject.com/en/2.1/howto/static-files/deployment/
* Use minified versions of Javascript libs.
* Web application security