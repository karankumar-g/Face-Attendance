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


class Session(models.Model):
    session_name = models.CharField(max_length=255)
    session_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.session_name


class Attendance(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.person.name} - {self.session.session_name} - {self.timestamp}"
