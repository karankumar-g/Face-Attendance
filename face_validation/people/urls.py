from django.urls import path
from .views import add_person, validate_person

urlpatterns = [
    path('add/', add_person, name='add_person'),
    path('validate/', validate_person, name='validate_person'),
]
