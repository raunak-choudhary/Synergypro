from django.shortcuts import render, get_object_or_404
from ..models.task_models import Task, TaskFile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

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
            'start_date': task.start_date.strftime('%Y-%m-%d'),
            'end_date': task.end_date.strftime('%Y-%m-%d') if task.end_date else None,
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

            task.title = data.get('title', task.title)
            task.start_date = data.get('start_date', task.start_date)
            task.end_date = data.get('end_date', task.end_date)
            task.description = data.get('description', task.description)

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
