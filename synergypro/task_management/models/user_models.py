from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = [
        ('individual', 'Individual/Freelancer'),
        ('team', 'Team Member'),
    ]
    
    PROFILE_TYPE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('freelancer', 'Freelancer'),
        ('professional', 'Working Professional'),
        ('hr', 'Human Resource (HR)'),
    ]

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    profile_type = models.CharField(max_length=20, choices=PROFILE_TYPE_CHOICES)
    university_name = models.CharField(max_length=100, default='N/A')
    organization_name = models.CharField(max_length=100, default='N/A')
    organization_website = models.URLField(max_length=200, default='N/A')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if self.profile_type in ['student', 'teacher']:
            self.organization_name = 'N/A'
            self.organization_website = 'N/A'
        elif self.profile_type in ['freelancer', 'professional', 'hr']:
            self.university_name = 'N/A'
            if not self.organization_website:
                self.organization_website = 'N/A'
        super().save(*args, **kwargs)