from django.urls import path
from .views import auth_views, dashboard_views, contact_views

urlpatterns = [
    # Authentication URLs
    path('api/signup/', auth_views.signup_view, name='signup'),
    path('api/login/', auth_views.login_view, name='login'),
    path('api/logout/', auth_views.logout_view, name='logout'),
    
    # Contact URLs
    path('api/contact/', contact_views.submit_query, name='submit_query'),
    # path('dashboard/', dashboard_view, name='dashboard'),

    # Dashboard URLs
    path('dashboard/', dashboard_views.dashboard_router, name='dashboard_router'),
    path('dashboard/individual/student/', dashboard_views.individual_student_dashboard, name='individual_student_dashboard'),
    path('dashboard/individual/freelancer/', dashboard_views.individual_freelancer_dashboard, name='individual_freelancer_dashboard'),
    path('dashboard/team/student/', dashboard_views.team_student_dashboard, name='team_student_dashboard'),
    path('dashboard/team/professional/', dashboard_views.team_professional_dashboard, name='team_professional_dashboard'),
    path('dashboard/team/teacher/', dashboard_views.team_teacher_dashboard, name='team_teacher_dashboard'),
    path('dashboard/team/hr/', dashboard_views.team_hr_dashboard, name='team_hr_dashboard'),
]