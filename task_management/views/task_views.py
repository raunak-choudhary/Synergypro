from django.shortcuts import render, get_object_or_404
from ..models.task_models import Task, TaskFile, TaskCategory
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils.dateparse import parse_datetime

def tasks_view(request):
    tasks = Task.objects.all().order_by('-created_at')
    return render(request, 'task_management/dashboard/tasks.html', {'tasks': tasks})

def tasks_api(request):
    tasks = Task.objects.all().order_by('-created_at')
    tasks_data = [
        {
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'start_date': task.start_date.isoformat() if task.start_date else None,
            'end_date': task.end_date.isoformat() if task.end_date else None,
            'status': task.status,
            'is_overdue': task.is_overdue(),
        }
        for task in tasks
    ]
    return JsonResponse(tasks_data, safe=False)

def task_detail_view(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    task_files = task.files.all()
    return render(request, 'task_management/dashboard/task_detail.html', {
        'task': task,
        'task_files': task_files
    })

def get_task_files(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    files = task.files.all()
    files_data = [
        {
            'id': file.id,
            'name': file.file.name,
            'url': file.file.url,
            'uploaded_at': file.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        for file in files
    ]
    return JsonResponse(files_data, safe=False)

@csrf_exempt
def upload_task_file(request, task_id):
    if request.method == 'POST':
        task = get_object_or_404(Task, id=task_id)
        if 'file' in request.FILES:
            file = request.FILES['file']
            task_file = TaskFile.objects.create(task=task, file=file)
            return JsonResponse({
                'status': 'success',
                'file_id': task_file.id,
                'file_url': task_file.file.url
            })
    return JsonResponse({'status': 'error'}, status=400)

@csrf_exempt
def delete_task_file(request, file_id):
    if request.method == 'DELETE':
        try:
            file = get_object_or_404(TaskFile, id=file_id)
            file.delete()
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def update_task(request, task_id):
    if request.method == 'POST':
        try:
            task = get_object_or_404(Task, id=task_id)
            data = json.loads(request.body)

            start_date = parse_datetime(data.get('start_date')) if data.get('start_date') else task.start_date
            end_date = parse_datetime(data.get('end_date')) if data.get('end_date') else task.end_date

            if start_date:
                task.start_date = start_date
            if end_date:
                task.end_date = end_date

            task.title = data.get('title', task.title)
            task.description = data.get('description', task.description)
            task.status = data.get('status', task.status)

            task.save()

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def delete_task(request, task_id):
    if request.method == 'DELETE':
        try:
            task = get_object_or_404(Task, id=task_id)
            task.delete()
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


@csrf_exempt
def create_category(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')

            category = TaskCategory.objects.create(
                user=request.user,
                name=name
            )

            return JsonResponse({
                'status': 'success',
                'category': {
                    'id': category.id,
                    'name': category.name
                }
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)


def get_user_categories(request):
    categories = TaskCategory.objects.filter(user=request.user)
    return JsonResponse({
        'categories': [
            {'id': cat.id, 'name': cat.name}
            for cat in categories
        ]
    })


@csrf_exempt
def update_task_category(request, task_id):
    if request.method == 'POST':
        try:
            task = get_object_or_404(Task, id=task_id, user=request.user)
            data = json.loads(request.body)
            category_id = data.get('category_id')

            if category_id:
                category = get_object_or_404(TaskCategory, id=category_id, user=request.user)
                task.category = category
            else:
                task.category = None

            task.save()
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
