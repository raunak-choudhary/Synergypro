# Generated by Django 5.0 on 2024-11-28 18:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("task_management", "0010_alter_task_task_file_taskfile"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="task",
            name="file_uploaded_at",
        ),
        migrations.RemoveField(
            model_name="task",
            name="task_file",
        ),
    ]
