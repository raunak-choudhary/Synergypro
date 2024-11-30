# Generated by Django 5.0 on 2024-11-29 19:42

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("task_management", "0006_rename_date_task_start_date_task_end_date"),
    ]

    operations = [
        migrations.CreateModel(
            name="DailyArticleSelection",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("profile_type", models.CharField(max_length=20)),
                ("date", models.DateField(default=datetime.date.today)),
                ("title", models.CharField(max_length=255)),
                ("url", models.URLField()),
                ("source", models.CharField(max_length=100)),
                ("published_date", models.CharField(max_length=50)),
                ("category", models.CharField(max_length=50)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name_plural": "Daily Article Selections",
                "ordering": ["-date", "profile_type", "category"],
                "unique_together": {("profile_type", "date", "url")},
            },
        ),
        migrations.CreateModel(
            name="ProfileKeywords",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("profile_type", models.CharField(max_length=20)),
                ("keyword", models.CharField(max_length=50)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name_plural": "Profile Keywords",
                "ordering": ["profile_type", "keyword"],
                "unique_together": {("profile_type", "keyword")},
            },
        ),
    ]
