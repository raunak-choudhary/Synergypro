from django.urls import path, include
from .views import auth_views, contact_views, dashboard_views
from .views.calendar_views import calendar_view, create_task
from .views.task_views import tasks_view, tasks_api, task_detail_view, upload_task_file, update_task, delete_task
from .views import help_views

urlpatterns = [

    path('', auth_views.home_view, name='home'),
    # Authentication URLs
    path('api/signup/', auth_views.signup_view, name='signup'),
    path('api/login/', auth_views.login_view, name='login'),
    path('api/logout/', auth_views.logout_view, name='logout'), # Changed this line

    # Contact paths
    path('api/contact/', contact_views.submit_query, name='submit_query'),

    # Dashboard URLs
    path('dashboard/individual/student/', dashboard_views.individual_student_dashboard, name='individual_student_dashboard'),
    path('dashboard/individual/freelancer/', dashboard_views.individual_freelancer_dashboard, name='individual_freelancer_dashboard'),
    
    # Profile path
    path('profile/', dashboard_views.profile_view, name='profile'),

    # Profile image upload path and capture image
    path('api/profile/upload-image/', dashboard_views.upload_profile_image, name='upload_profile_image'),
    path('api/profile/capture-image/', dashboard_views.capture_profile_image, name='capture_profile_image'),

    # Generate and Verify OTP
    path('api/otp/', include([
        path('generate/', dashboard_views.generate_verification_otp, name='generate_otp'),
        path('verify/', dashboard_views.verify_otp, name='verify_otp'),
        path('status/', dashboard_views.verification_status, name='verification_status'),  # New endpoint
        path('resend/', dashboard_views.resend_otp, name='resend_otp'),  # New endpoint
    ])),

    # Calendar path
    path('dashboard/calendar/', calendar_view, name='calendar'),
    path('api/tasks/create/', create_task, name='create_task'),
    path('tasks/', tasks_view, name='tasks'),
    path('api/tasks/', tasks_api, name='tasks_api'),
    path('task/<int:task_id>/', task_detail_view, name='task_detail'),
    path('task/<int:task_id>/upload/', upload_task_file, name='upload_task_file'),
    path('api/task/<int:task_id>/update/', update_task, name='update_task'),
    path('api/task/<int:task_id>/delete/', delete_task, name='delete_task'),

    #Help Center Page
    path('help-center/', help_views.help_center_view, name='help_center'),
    path('api/help-center/analytics', help_views.track_help_center_analytics, name='help_center_analytics'),
]
