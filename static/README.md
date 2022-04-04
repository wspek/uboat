We create _another_ directory named after the app, to provide namespacing. 

Now we might be able to get away with putting our static files directly in `my_app/static/` (rather than creating another `my_app` subdirectory), but it would actually be a bad idea. Django will use the first static file it finds whose name matches, and if you had a static file with the same name in a different application, Django would be unable to distinguish between them. We need to be able to point Django at the right one, and the easiest way to ensure this is by namespacing them. That is, by putting those static files inside another directory named for the application itself.

See: https://docs.djangoproject.com/en/2.1/howto/static-files/

In addition to these configuration steps, you’ll also need to actually serve the static files.

During development, if you use `django.contrib.staticfiles`, this will be done automatically by runserver when `DEBUG` is set to `True` (see `django.contrib.staticfiles.views.serve()`).

This method is grossly inefficient and probably insecure, so it is unsuitable for production.

See Deploying static files (https://docs.djangoproject.com/en/2.1/howto/static-files/deployment/) for proper strategies to serve static files in production environments.