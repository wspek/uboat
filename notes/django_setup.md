# Steps during development

* Create general django venv in '/home/wspek/Development/python/django_projects'
* Create project with "general" django venv: django-admin startproject locallibrary
* Within this, create the specific venv
    * `virtualenv -p python3 venv-subtitle_search_backend`
    * `pip3 install django`
* `python3 manage.py startapp catalog`
* Register the catalog application with the project: 
  - Add this to installed apps: `'catalog.apps.CatalogConfig'`
* Specifying the database
  - Using default. No changes.
* Changed TIME_ZONE to 'America/Argentina/Buenos_Aires'
* Add URL pattern(s) to urls.py. For instance: 

    ```python
    from django.urls import include
    
    path('catalog/', include('catalog.urls')),
    ```
* Use static() to add url mapping to serve static files during development (only)

    ```python
    from django.conf import settings
    from django.conf.urls.static import static
    
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    ```
* Create urls.py file in catalog folder:

    ```python
    from django.urls import path
    from . import views
    
    urlpatterns = [
    
    ]
    ```
* Run a database migration to include any models of installed applications.

    ```python
    python3 manage.py makemigrations
    python3 manage.py migrate
    ```
* Design models with UML: https://mzl.la/2zwkYkP
* Add models
* After adding models, run database migrations

    ```
    python3 manage.py makemigrations
    python3 manage.py migrate
    ```
   
* Register the models in the admin.py of the application:

    ```python
    from catalog.models import Author, Genre, Book, BookInstance
    
    admin.site.register(Book)
    admin.site.register(Author)
    admin.site.register(Genre)
    admin.site.register(BookInstance)
    ```

* Create superuser (staff member) for the admin site. In the same folder as manage.py:

python3 manage.py createsuperuser

* Run server. And login to admin site. Add model instances.
* To change how a model is displayed in the admin interface, define a ModelAdmin class
    * Change how the model is displayed in the list
  
* Design the website. Which URLs do we want and what will they display?
* Add the URL mappings to the app/urls.py, for instance: `path('', views.index, name='index')` 
* Create corresponding views in the app/view.py file.
* Create a corresponding template. Create templates/ folder in app folder.
    * Generic base template: base_generic.html
    * Templates to extend base template: index.html
* Put additional style in app/static/css.
* You need to point Django to search for your templates in the templates folder. To do that, add the templates dir to the TEMPLATES object by editing the settings.py

* When using forms, get the data with `form.cleaned_data['renewal_date']` and not by getting it through the GET/POST. In this way you will have the sanitized data.
* 