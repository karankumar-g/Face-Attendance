from django.db import models


class Person(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    year = models.CharField(max_length=50)
    department = models.CharField(max_length=50)
    roll_no = models.CharField(max_length=50, unique=True)
    face_encoding = models.TextField()

    def __str__(self):
        return self.name
