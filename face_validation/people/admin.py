from django.contrib import admin
from .models import Person

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('name', 'roll_no', 'age', 'class_name', 'department')
    search_fields = ('name', 'roll_no')
