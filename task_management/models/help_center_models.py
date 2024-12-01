from django.db import models
from datetime import date

class ProfileKeywords(models.Model):
    """Stores predefined keywords for each profile type"""
    profile_type = models.CharField(max_length=20)
    keyword = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Profile Keywords"
        unique_together = ('profile_type', 'keyword')
        ordering = ['profile_type', 'keyword']
    
    def __str__(self):
        return f"{self.profile_type}: {self.keyword}"

class DailyArticleSelection(models.Model):
    """Stores daily selected articles for each profile type"""
    profile_type = models.CharField(max_length=20)
    date = models.DateField(default=date.today)
    title = models.CharField(max_length=255)
    url = models.URLField()
    source = models.CharField(max_length=100)
    published_date = models.CharField(max_length=50)
    category = models.CharField(max_length=50)
    highlight = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Daily Article Selections"
        unique_together = ('profile_type', 'date', 'url')
        ordering = ['-date', 'profile_type', 'category']
    
    def __str__(self):
        return f"{self.profile_type} - {self.title} ({self.date})"