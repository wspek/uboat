from django.urls import path
from apps.fetch import views

urlpatterns = [
    path('', views.fetch, name='fetch'),                    # /fetch
    path('languages', views.languages, name='languages'),   # /fetch/languages
]
