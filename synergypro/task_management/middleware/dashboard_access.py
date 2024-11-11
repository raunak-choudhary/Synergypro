# task_management/middleware/dashboard_access.py
from django.shortcuts import redirect
from django.urls import reverse
from django.http import HttpResponseForbidden

class DashboardAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and 'dashboard' in request.path:
            # Skip for the dashboard router
            if request.path == reverse('dashboard_router'):
                return self.get_response(request)

            # Check if user is accessing the correct dashboard type
            user_type = request.user.user_type
            profile_type = request.user.profile_type
            current_path = request.path

            # Validate user type access
            if user_type == 'individual' and 'team' in current_path:
                return redirect('dashboard_router')
            elif user_type == 'team' and 'individual' in current_path:
                return redirect('dashboard_router')

            # Validate profile type access
            if user_type == 'individual':
                if profile_type == 'student' and 'student' not in current_path:
                    return redirect('dashboard_router')
                elif profile_type == 'freelancer' and 'freelancer' not in current_path:
                    return redirect('dashboard_router')
            elif user_type == 'team':
                if profile_type == 'student' and 'team/student' not in current_path:
                    return redirect('dashboard_router')
                elif profile_type == 'professional' and 'team/professional' not in current_path:
                    return redirect('dashboard_router')
                elif profile_type == 'teacher' and 'team/teacher' not in current_path:
                    return redirect('dashboard_router')
                elif profile_type == 'hr' and 'team/hr' not in current_path:
                    return redirect('dashboard_router')

        return self.get_response(request)