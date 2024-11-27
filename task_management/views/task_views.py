from django.shortcuts import render, get_object_or_404
from ..models.task_models import Task
from django.http import JsonResponse

def tasks_view(request):
    tasks = Task.objects.all().order_by('-created_at')
    return render(request, 'task_management/dashboard/tasks.html', {'tasks': tasks})

def tasks_api(request):
    tasks = Task.objects.all().order_by('-created_at')
    print(f"Number of tasks: {tasks.count()}")
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

def task_detail(request, pk):
    task = get_object_or_404(Task, pk=pk)
    return render(request, 'task_management/dashboard/task_detail.html', {'task': task})
