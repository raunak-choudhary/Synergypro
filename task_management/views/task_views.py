from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from ..models.task_models import Task, TaskComment, TaskFile
import json
from django.core.exceptions import ValidationError
from django.conf import settings
import os
import mimetypes

@login_required
def tasks_view(request):
    tasks = Task.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'task_management/dashboard/tasks.html', {'tasks': tasks})

@login_required
def task_detail_view(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    if task.user != request.user:
        raise PermissionDenied
    return render(request, 'task_management/dashboard/task_detail.html', {'task': task})

@login_required
def tasks_api(request):
    tasks = Task.objects.filter(user=request.user).order_by('-created_at')
    tasks_data = [{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'start_date': task.start_date.isoformat() if task.start_date else None,
        'start_time': task.start_time.isoformat() if task.start_time else None,
        'end_date': task.end_date.isoformat() if task.end_date else None,
        'end_time': task.end_time.isoformat() if task.end_time else None,
        'status': task.status,
        'priority': task.priority,
        'task_progress': task.task_progress,
        'is_overdue': task.is_overdue(),
    } for task in tasks]
    return JsonResponse(tasks_data, safe=False)

@login_required
def task_detail_api(request, task_id):
    task = get_object_or_404(Task, id=task_id, user=request.user)
    
    if request.method == 'GET':
        return JsonResponse({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'start_date': task.start_date.isoformat() if task.start_date else None,
            'start_time': task.start_time.strftime('%H:%M') if task.start_time else None,
            'end_date': task.end_date.isoformat() if task.end_date else None,
            'end_time': task.end_time.strftime('%H:%M') if task.end_time else None,
            'status': task.status,
            'priority': task.priority,
            'task_progress': task.task_progress,
        })
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            task.title = data.get('title', task.title)
            task.description = data.get('description', task.description)
            task.start_date = data.get('start_date', task.start_date)
            task.start_time = data.get('start_time', task.start_time)
            task.end_date = data.get('end_date', task.end_date)
            task.end_time = data.get('end_time', task.end_time)
            task.status = data.get('status', task.status)
            task.priority = data.get('priority', task.priority)
            task.task_progress = data.get('task_progress', task.task_progress)
            task.save()
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        task.delete()
        return JsonResponse({'status': 'success'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
def task_comments_api(request, task_id):
    task = get_object_or_404(Task, id=task_id, user=request.user)
    
    if request.method == 'GET':
        comments = task.comments.all()
        comments_data = [{
            'id': comment.id,
            'text': comment.text,
            'author': comment.user.get_full_name() or comment.user.username,
            'created_at': comment.created_at.isoformat(),
        } for comment in comments]
        return JsonResponse(comments_data, safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            comment = TaskComment.objects.create(
                task=task,
                user=request.user,
                text=data['text']
            )
            return JsonResponse({
                'id': comment.id,
                'text': comment.text,
                'author': comment.user.get_full_name() or comment.user.username,
                'created_at': comment.created_at.isoformat(),
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
@login_required
def delete_task(request, task_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    task = get_object_or_404(Task, id=task_id, user=request.user)
    try:
        task.delete()
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
def validate_file(file):
    # Check file size (10MB limit)
    if file.size > 10 * 1024 * 1024:  
        raise ValidationError('File size must be no more than 10MB')
    
    file_extension = os.path.splitext(file.name)[1].lower()
    
    allowed_extensions = [
        '.pdf', '.docx', '.xlsx', '.txt', 
        '.png', '.jpg', '.jpeg', '.pptx'
    ]
    
    if file_extension not in allowed_extensions:
        raise ValidationError(
            f'Invalid file type. Allowed types are: {", ".join(allowed_extensions)}'
        )

@login_required
def upload_task_file(request, task_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    task = get_object_or_404(Task, id=task_id, user=request.user)
    
    if 'file' not in request.FILES:
        return JsonResponse({'error': 'No file provided'}, status=400)
    
    file = request.FILES['file']
    
    try:
        validate_file(file)
        
        task_file = TaskFile.objects.create(
            task=task,
            user=request.user,
            file=file,
            original_filename=file.name,
            file_size=file.size,
            file_type=os.path.splitext(file.name)[1].lower()
        )
        
        return JsonResponse({
            'id': task_file.id,
            'filename': task_file.original_filename,
            'size': task_file.file_size,
            'uploaded_at': task_file.uploaded_at.isoformat(),
            'file_type': task_file.file_type
        })
        
    except ValidationError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': 'Error uploading file'}, status=500)
    
@login_required
def task_files_api(request, task_id):
    task = get_object_or_404(Task, id=task_id, user=request.user)
    
    if request.method == 'GET':
        files = TaskFile.objects.filter(task=task)
        files_data = [{
            'id': f.id,
            'filename': f.original_filename,
            'size': f.file_size,
            'uploaded_at': f.uploaded_at.isoformat(),
            'file_type': f.file_type
        } for f in files]
        return JsonResponse(files_data, safe=False)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
def task_file_detail_api(request, task_id, file_id):
    task = get_object_or_404(Task, id=task_id, user=request.user)
    task_file = get_object_or_404(TaskFile, id=file_id, task=task)
    
    if request.method == 'DELETE':
        task_file.delete()
        return JsonResponse({'status': 'success'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
    
