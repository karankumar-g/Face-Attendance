from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.add_person, name='add_person'),
    path('validate/', views.validate_person, name='validate_person'),
    path('create_session/', views.create_session, name='create_session'),
    path('list_sessions/', views.list_sessions, name='list_sessions'),
    path('get_attendance/<str:session_id>/',
         views.get_attendance, name='get_attendance'),
]
