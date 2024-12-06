from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import time

User = get_user_model()

class Task(models.Model):
    STATUS_CHOICES = [
        ('yet_to_start', 'Yet to Start'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Updated date and time fields
    start_date = models.DateField(default=timezone.now)
    start_time = models.TimeField(default=time(0, 0))  # default to 00:00
    end_date = models.DateField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='yet_to_start')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    task_progress = models.IntegerField(default=0)
    task_owner = models.CharField(max_length=150)
    
    def is_overdue(self):
        today = timezone.now().date()
        now = timezone.now().time()
        return (self.end_date < today or 
                (self.end_date == today and self.end_time < now))
    
    def __str__(self):
        return self.title
    
class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Comment by {self.user.username} on {self.task.title}'
