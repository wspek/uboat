from django.urls import path
from apps.fetch import views

urlpatterns = [
    path('', views.fetch, name='fetch'),                                # /fetch
    path('login', views.login, name='login'),                           # /fetch/login
    path('languages', views.languages, name='languages'),               # /fetch/languages
    path('server_health', views.server_health, name='server_health'),   # /fetch/server_health
]
