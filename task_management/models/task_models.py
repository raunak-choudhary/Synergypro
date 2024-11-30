from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

def user_directory_path(instance, filename):
    return f'task_files/{instance.task.user.id}/{instance.task.id}/{filename}'

class Task(models.Model):
    STATUS_CHOICES = [
        ('yet_to_start', 'Yet to Start'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='yet_to_start')

    def is_overdue(self):
        if not self.end_date:
            return False
        return self.end_date < timezone.now()

    def __str__(self):
        return self.title

class TaskFile(models.Model):
    task = models.ForeignKey(Task, related_name='files', on_delete=models.CASCADE)
    file = models.FileField(upload_to=user_directory_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.task.title} - {self.file.name}"
