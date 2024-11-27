from django.shortcuts import render, get_object_or_404
from ..models.task_models import Task
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
        }
        for task in tasks
    ]
    return JsonResponse(tasks_data, safe=False)

def task_detail_view(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    return render(request, 'task_management/dashboard/task_detail.html', {
        'task': task,
        'file_url': task.task_file.url if task.task_file else None
    })

@csrf_exempt
def upload_task_file(request, task_id):
    if request.method == 'POST':
        task = get_object_or_404(Task, id=task_id)
        if 'file' in request.FILES:
            try:
                file = request.FILES['file']
                # Delete old file if it exists
                if task.task_file:
                    task.task_file.delete()
                task.task_file = file
                task.save()
                return JsonResponse({
                    'status': 'success',
                    'file_url': task.task_file.url
                })
            except Exception as e:
                return JsonResponse({
                    'status': 'error',
                    'error': str(e)
                }, status=400)
    return JsonResponse({'status': 'error', 'error': 'Invalid request'}, status=400)


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
