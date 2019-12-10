from django.urls import path
from apps.sink import views

urlpatterns = [
    path('', views.sink, name='sink'),                                # /sink
    path('login', views.login, name='login'),                           # /sink/login
    path('languages', views.languages, name='languages'),               # /sink/languages
    path('server_health', views.server_health, name='server_health'),   # /sink/server_health
]
