from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    task_file = models.FileField(upload_to='task_files/%Y/%m/%d/', null=True, blank=True)
    file_uploaded_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
