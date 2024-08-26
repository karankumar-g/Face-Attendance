from django.contrib import admin
from .models import Person, Session, Attendance


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('name', 'roll_no', 'age', 'year', 'department')
    search_fields = ('name', 'roll_no')


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('session_name', 'session_id', 'created_at')
    search_fields = ('session_name', 'session_id')


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('person', 'session', 'timestamp')
    search_fields = ('person__name', 'session__session_name')
    list_filter = ('session', 'timestamp')
