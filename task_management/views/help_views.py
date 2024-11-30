from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
import logging
from ..services.news_service import NewsService

logger = logging.getLogger(__name__)
news_service = NewsService()

@login_required
def help_center_view(request):
    profile_type = request.user.profile_type
    articles = news_service.fetch_medium_articles(profile_type)
    
    print(f"Number of articles: {len(articles)}")
    for article in articles:
        print(f"Article: {article['title']}")
        print(f"URL: {article['url']}")
        print(f"Date: {article['published_date']}")
        print("---")
    
    context = {
        'learning_paths': get_learning_paths(profile_type),
        'articles': articles,
        'tools': get_tools_and_resources(profile_type),
        'user': request.user
    }
    
    return render(request, 'task_management/dashboard/help_center.html', context)

def get_learning_paths(profile_type):
    """
    Returns personalized learning paths based on user type.
    """
    paths = {
        'student': [
            {
                'icon': '📚',
                'title': 'Study Techniques Mastery',
                'description': 'Learn effective study methods and time management',
                'progress': 65
            },
            {
                'icon': '📝',
                'title': 'Assignment Planning',
                'description': 'Master the art of planning and completing assignments',
                'progress': 30
            },
            {
                'icon': '🎯',
                'title': 'Goal Setting',
                'description': 'Set and achieve academic goals effectively',
                'progress': 45
            }
        ],
        'freelancer': [
            {
                'icon': '💼',
                'title': 'Client Management',
                'description': 'Effective strategies for managing client relationships',
                'progress': 70
            },
            {
                'icon': '⏰',
                'title': 'Time Management',
                'description': 'Optimize your workflow and meet deadlines',
                'progress': 55
            },
            {
                'icon': '📈',
                'title': 'Project Tracking',
                'description': 'Track and report project progress effectively',
                'progress': 40
            }
        ],
        'hr': [
            {
                'icon': '👥',
                'title': 'Employee Management',
                'description': 'Best practices for managing employee records and tasks',
                'progress': 60
            },
            {
                'icon': '📋',
                'title': 'Recruitment Workflow',
                'description': 'Streamline your recruitment and onboarding process',
                'progress': 45
            },
            {
                'icon': '📊',
                'title': 'HR Analytics',
                'description': 'Track and analyze HR metrics effectively',
                'progress': 35
            }
        ],
        'teacher': [
            {
                'icon': '📖',
                'title': 'Lesson Planning',
                'description': 'Organize and structure your teaching materials',
                'progress': 75
            },
            {
                'icon': '👨‍🏫',
                'title': 'Class Management',
                'description': 'Effective strategies for managing classroom tasks',
                'progress': 50
            },
            {
                'icon': '📝',
                'title': 'Assessment Tracking',
                'description': 'Track and manage student assessments efficiently',
                'progress': 40
            }
        ],
        'professional': [
            {
                'icon': '💼',
                'title': 'Task Management',
                'description': 'Optimize your professional workflow',
                'progress': 65
            },
            {
                'icon': '👥',
                'title': 'Team Collaboration',
                'description': 'Enhance team coordination and productivity',
                'progress': 55
            },
            {
                'icon': '📊',
                'title': 'Performance Tracking',
                'description': 'Monitor and improve work performance',
                'progress': 45
            }
        ]
    }
    
    return paths.get(profile_type, [])

def get_tools_and_resources(profile_type):
    """
    Returns relevant tools and resources based on user type.
    """
    tools = {
        'student': [
            {
                'icon': '📅',
                'title': 'Study Schedule Template',
                'description': 'Organize your study sessions effectively',
                'file_path': 'static/templates/study_schedule_template.pdf'
            },
            {
                'icon': '📊',
                'title': 'Progress Tracker',
                'description': 'Track your academic progress',
                'file_path': 'static/templates/progress_tracker.xlsx'
            },
            {
                'icon': '✅',
                'title': 'Assignment Checklist',
                'description': 'Never miss an assignment deadline',
                'file_path': 'static/templates/assignment_checklist.pdf'
            }
        ],
        'freelancer': [
            {
                'icon': '📋',
                'title': 'Project Timeline Template',
                'description': 'Plan your project milestones',
                'file_path': 'static/templates/project_timeline.xlsx'
            },
            {
                'icon': '💰',
                'title': 'Invoice Template',
                'description': 'Professional invoice template for clients',
                'file_path': 'static/templates/invoice_template.docx'
            },
            {
                'icon': '📈',
                'title': 'Client Report Template',
                'description': 'Create professional client reports',
                'file_path': 'static/templates/client_report.pptx'
            }
        ],
        'hr': [
            {
                'icon': '📋',
                'title': 'Employee Record Template',
                'description': 'Manage employee information efficiently',
                'file_path': 'static/templates/employee_record_template.xlsx'
            },
            {
                'icon': '📝',
                'title': 'HR Policy Template',
                'description': 'Standardize HR policies and procedures',
                'file_path': 'static/templates/hr_policy_template.docx'
            },
            {
                'icon': '📊',
                'title': 'HR Metrics Dashboard',
                'description': 'Track key HR performance indicators',
                'file_path': 'static/templates/hr_metrics_dashboard.xlsx'
            }
        ],
        'teacher': [
            {
                'icon': '📚',
                'title': 'Lesson Plan Template',
                'description': 'Structure your lessons effectively',
                'file_path': 'static/templates/lesson_plan_template.docx'
            },
            {
                'icon': '📊',
                'title': 'Grade Tracker',
                'description': 'Monitor student progress efficiently',
                'file_path': 'static/templates/grade_tracker.xlsx'
            },
            {
                'icon': '📝',
                'title': 'Assessment Template',
                'description': 'Create standardized assessments',
                'file_path': 'static/templates/assessment_template.docx'
            }
        ],
        'professional': [
            {
                'icon': '📋',
                'title': 'Project Planner',
                'description': 'Plan and track project progress',
                'file_path': 'static/templates/project_planner.xlsx'
            },
            {
                'icon': '📊',
                'title': 'Performance Dashboard',
                'description': 'Track key performance metrics',
                'file_path': 'static/templates/performance_dashboard.xlsx'
            },
            {
                'icon': '📝',
                'title': 'Meeting Minutes Template',
                'description': 'Document meetings effectively',
                'file_path': 'static/templates/meeting_minutes.docx'
            }
        ]
    }
    
    return tools.get(profile_type, [])

@login_required
def track_help_center_analytics(request):
    """
    API endpoint to track help center analytics.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        action = data.get('action')
        analytics_data = data.get('data', {})
        
        # Add user context to analytics
        analytics_data['profile_type'] = request.user.profile_type
        analytics_data['user_id'] = request.user.id
        
        # Log analytics data
        logger.info(f"Help Center Analytics - Action: {action}, Data: {analytics_data}")
        
        return JsonResponse({'status': 'success'})
        
    except Exception as e:
        logger.error(f"Error tracking analytics: {e}")
        return JsonResponse({'error': 'Internal server error'}, status=500)