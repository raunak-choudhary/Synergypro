from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.urls import reverse
from ..models import CustomUser, Task, Project, Team  # Import your models
from datetime import datetime, timedelta

def get_dashboard_url(user):
    """
    Determine the appropriate dashboard URL based on user type and profile
    """
    if user.user_type == 'individual':
        if user.profile_type == 'student':
            return reverse('individual_student_dashboard')
        elif user.profile_type == 'freelancer':
            return reverse('individual_freelancer_dashboard')
    elif user.user_type == 'team':
        if user.profile_type == 'student':
            return reverse('team_student_dashboard')
        elif user.profile_type == 'professional':
            return reverse('team_professional_dashboard')
        elif user.profile_type == 'teacher':
            return reverse('team_teacher_dashboard')
        elif user.profile_type == 'hr':
            return reverse('team_hr_dashboard')
    
    return reverse('dashboard_router')

@login_required
def dashboard_router(request):
    """
    Route users to their appropriate dashboard based on their type and profile
    """
    return redirect(get_dashboard_url(request.user))

# Helper functions for getting dashboard data
def get_student_tasks(user):
    """Get tasks for student dashboard"""
    # For now, return dummy data
    return {
        'pending_tasks': [
            {'title': 'Database Assignment', 'due_date': '2024-03-20', 'priority': 'High'},
            {'title': 'Project Presentation', 'due_date': '2024-03-25', 'priority': 'Medium'}
        ],
        'completed_tasks': [
            {'title': 'Python Quiz', 'completion_date': '2024-03-15', 'score': '95%'}
        ]
    }

def get_upcoming_deadlines(user):
    """Get upcoming deadlines for any user"""
    # Dummy data
    return [
        {'title': 'Project Milestone 1', 'due_date': '2024-03-22'},
        {'title': 'Team Meeting', 'due_date': '2024-03-23'}
    ]

def get_study_progress(user):
    """Get study progress for students"""
    # Dummy data
    return {
        'overall_progress': 75,
        'subjects': [
            {'name': 'Database', 'progress': 80},
            {'name': 'Python', 'progress': 70},
            {'name': 'Web Development', 'progress': 75}
        ]
    }

def get_freelancer_projects(user):
    """Get projects for freelancer dashboard"""
    # Dummy data
    return {
        'active_projects': [
            {'title': 'E-commerce Website', 'client': 'TechCorp', 'progress': 60},
            {'title': 'Mobile App UI', 'client': 'StartupX', 'progress': 30}
        ],
        'completed_projects': [
            {'title': 'Logo Design', 'client': 'DesignCo', 'completion_date': '2024-03-10'}
        ]
    }

def get_time_tracking(user):
    """Get time tracking data for freelancers"""
    # Dummy data
    return {
        'today': 6.5,
        'this_week': 32.5,
        'this_month': 120
    }

def get_team_tasks(user):
    """Get tasks for team members"""
    # Dummy data
    return {
        'team_tasks': [
            {'title': 'Sprint Planning', 'assigned_to': ['John', 'Sarah'], 'status': 'In Progress'},
            {'title': 'Code Review', 'assigned_to': ['Mike'], 'status': 'Pending'}
        ]
    }

def get_team_members(user):
    """Get team members data"""
    # Dummy data
    return [
        {'name': 'John Doe', 'role': 'Developer', 'status': 'Online'},
        {'name': 'Sarah Smith', 'role': 'Designer', 'status': 'Offline'}
    ]

def get_team_progress(user):
    """Get team progress data"""
    # Dummy data
    return {
        'overall_progress': 65,
        'milestones_completed': 3,
        'milestones_remaining': 2
    }

def get_professional_projects(user):
    """Get projects for professional dashboard"""
    # Dummy data
    return {
        'current_projects': [
            {
                'name': 'Project Alpha',
                'progress': 75,
                'team_size': 5,
                'deadline': '2024-04-15'
            },
            {
                'name': 'Project Beta',
                'progress': 30,
                'team_size': 3,
                'deadline': '2024-05-01'
            }
        ]
    }

def get_team_stats(user):
    """Get team statistics"""
    # Dummy data
    return {
        'team_size': 8,
        'active_tasks': 12,
        'completed_tasks': 45,
        'upcoming_deadlines': 3
    }

def get_project_timeline(user):
    """Get project timeline data"""
    # Dummy data
    return {
        'milestones': [
            {'name': 'Planning Phase', 'status': 'Completed', 'date': '2024-03-01'},
            {'name': 'Development Sprint 1', 'status': 'In Progress', 'date': '2024-03-15'},
            {'name': 'Testing Phase', 'status': 'Pending', 'date': '2024-04-01'}
        ]
    }

def get_teacher_classes(user):
    """Get classes for teacher dashboard"""
    # Dummy data
    return [
        {
            'name': 'Web Development 101',
            'students': 25,
            'average_performance': 85,
            'next_class': '2024-03-21'
        },
        {
            'name': 'Database Design',
            'students': 30,
            'average_performance': 78,
            'next_class': '2024-03-22'
        }
    ]

def get_student_progress(user):
    """Get student progress data for teachers"""
    # Dummy data
    return {
        'class_averages': [
            {'class': 'Web Development', 'average': 85},
            {'class': 'Database Design', 'average': 78}
        ],
        'struggling_students': 3,
        'top_performers': 5
    }

def get_assignments(user):
    """Get assignments data for teachers"""
    # Dummy data
    return {
        'pending_review': [
            {'title': 'Final Project', 'submitted_by': 15, 'due_date': '2024-03-20'},
            {'title': 'Database Quiz', 'submitted_by': 28, 'due_date': '2024-03-18'}
        ]
    }

def get_employee_data(user):
    """Get employee data for HR dashboard"""
    # Dummy data
    return {
        'total_employees': 150,
        'departments': [
            {'name': 'Engineering', 'count': 45},
            {'name': 'Design', 'count': 20},
            {'name': 'Marketing', 'count': 15}
        ]
    }

def get_training_programs(user):
    """Get training programs data"""
    # Dummy data
    return [
        {
            'name': 'New Employee Orientation',
            'participants': 5,
            'start_date': '2024-03-25'
        },
        {
            'name': 'Leadership Training',
            'participants': 12,
            'start_date': '2024-04-01'
        }
    ]

def get_pending_reviews(user):
    """Get pending reviews data"""
    # Dummy data
    return [
        {'employee': 'John Doe', 'department': 'Engineering', 'due_date': '2024-03-30'},
        {'employee': 'Sarah Smith', 'department': 'Design', 'due_date': '2024-04-05'}
    ]

# Dashboard View Functions
@login_required
def individual_student_dashboard(request):
    if not (request.user.user_type == 'individual' and request.user.profile_type == 'student'):
        return HttpResponseForbidden("Access Denied")
    
    context = {
        'user': request.user,
        'tasks': get_student_tasks(request.user),
        'upcoming_deadlines': get_upcoming_deadlines(request.user),
        'study_progress': get_study_progress(request.user)
    }
    return render(request, 'task_management/dashboards/individual_student_dashboard.html', context)

@login_required
def individual_freelancer_dashboard(request):
    if not (request.user.user_type == 'individual' and request.user.profile_type == 'freelancer'):
        return HttpResponseForbidden("Access Denied")
    
    context = {
        'user': request.user,
        'projects': get_freelancer_projects(request.user),
        'time_tracking': get_time_tracking(request.user),
        'upcoming_deadlines': get_upcoming_deadlines(request.user)
    }
    return render(request, 'task_management/dashboards/individual_freelancer_dashboard.html', context)

@login_required
def team_student_dashboard(request):
    if not (request.user.user_type == 'team' and request.user.profile_type == 'student'):
        return HttpResponseForbidden("Access Denied")
    
    context = {
        'user': request.user,
        'team_tasks': get_team_tasks(request.user),
        'team_members': get_team_members(request.user),
        'team_progress': get_team_progress(request.user)
    }
    return render(request, 'task_management/dashboards/team_student_dashboard.html', context)

@login_required
def team_professional_dashboard(request):
    if not (request.user.user_type == 'team' and request.user.profile_type == 'professional'):
        return HttpResponseForbidden("Access Denied")
    
    context = {
        'user': request.user,
        'projects': get_professional_projects(request.user),
        'team_stats': get_team_stats(request.user),
        'timeline': get_project_timeline(request.user)
    }
    return render(request, 'task_management/dashboards/team_professional_dashboard.html', context)

@login_required
def team_teacher_dashboard(request):
    if not (request.user.user_type == 'team' and request.user.profile_type == 'teacher'):
        return HttpResponseForbidden("Access Denied")
    
    context = {
        'user': request.user,
        'classes': get_teacher_classes(request.user),
        'student_progress': get_student_progress(request.user),
        'assignments': get_assignments(request.user)
    }
    return render(request, 'task_management/dashboards/team_teacher_dashboard.html', context)

@login_required
def team_hr_dashboard(request):
    if not (request.user.user_type == 'team' and request.user.profile_type == 'hr'):
        return HttpResponseForbidden("Access Denied")
    
    context = {
        'user': request.user,
        'employees': get_employee_data(request.user),
        'trainings': get_training_programs(request.user),
        'reviews': get_pending_reviews(request.user)
    }
    return render(request, 'task_management/dashboards/team_hr_dashboard.html', context)