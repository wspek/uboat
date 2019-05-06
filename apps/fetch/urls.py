from django.urls import path
from apps.fetch import views

urlpatterns = [
    path('', views.fetch, name='fetch'),
]
