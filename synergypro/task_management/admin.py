from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models.user_models import CustomUser

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone', 'user_type', 'profile_type')
    search_fields = ('username', 'email', 'phone')
    list_filter = ('user_type', 'profile_type')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Additional info', {'fields': ('user_type', 'profile_type', 'university_name', 
                                      'organization_name', 'organization_website')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'email', 'phone', 'user_type', 'profile_type'),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)