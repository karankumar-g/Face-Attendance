# Generated by Django 5.1 on 2024-08-18 14:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('people', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='face_encoding',
            field=models.TextField(),
        ),
    ]
