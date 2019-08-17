from django.urls import path
from apps.fetch import views

urlpatterns = [
    path('', views.fetch, name='fetch'),                                # /fetch
    path('test_login', views.test_login, name='test_login'),            # /fetch/test_login
    path('languages', views.languages, name='languages'),               # /fetch/languages
    path('server_health', views.server_health, name='server_health'),   # /fetch/server_health
]
