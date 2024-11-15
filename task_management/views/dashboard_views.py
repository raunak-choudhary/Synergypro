from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import os
import time
from django.conf import settings
from django.views.decorators.http import require_http_methods
import base64
from PIL import Image
from io import BytesIO

@login_required
def profile_view(request):
    if request.method == 'POST':
        try:
            # Handle image upload
            if request.FILES.get('profile_image'):
                image = request.FILES['profile_image']
                
                # Validate image type
                if not image.content_type.startswith('image/'):
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Invalid file type. Please upload an image.'
                    }, status=400)
                
                # Check file size (limit to 5MB)
                if image.size > 5 * 1024 * 1024:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Image size should be less than 5MB.'
                    }, status=400)
                
                # Create media/profile_images directory if it doesn't exist
                profile_path = os.path.join(settings.MEDIA_ROOT, 'profile_images')
                os.makedirs(profile_path, exist_ok=True)
                
                # Generate unique filename
                ext = image.name.split('.')[-1].lower()
                if ext not in ['jpg', 'jpeg', 'png', 'gif']:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Invalid image format. Use JPG, PNG, or GIF.'
                    }, status=400)
                
                filename = f'profile_{request.user.id}.{ext}'
                filepath = os.path.join('profile_images', filename)
                
                # Save the file
                full_path = os.path.join(settings.MEDIA_ROOT, filepath)
                
                # Delete old file if exists
                if request.user.profile_image:
                    old_path = os.path.join(settings.MEDIA_ROOT, str(request.user.profile_image))
                    if os.path.exists(old_path):
                        os.remove(old_path)
                
                # Save new file
                with open(full_path, 'wb+') as destination:
                    for chunk in image.chunks():
                        destination.write(chunk)
                
                # Update user profile
                request.user.profile_image = filepath
                request.user.save()
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Profile image updated successfully',
                    'image_url': request.user.profile_image.url
                })
            
            # Handle other profile updates
            if request.POST.get('university_name') and request.user.profile_type in ['student', 'teacher']:
                request.user.university_name = request.POST.get('university_name')
                request.user.save()
            elif request.POST.get('organization_name'):
                request.user.organization_name = request.POST.get('organization_name')
                request.user.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Profile updated successfully'
            })
            
        except Exception as e:
            print(f"Error in profile update: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'An error occurred while updating profile'
            }, status=500)
    
    return render(request, 'task_management/dashboard/profile.html')

@login_required
def individual_student_dashboard(request):
    context = {
        'user': request.user,
        'total_tasks': 24,
        'in_progress': 8,
        'completed': 16
    }
    return render(request, 'task_management/dashboard/student.html', context)


@login_required
@require_http_methods(["POST"])
def upload_profile_image(request):
    try:
        image_file = request.FILES.get('image')
        if not image_file:
            return JsonResponse({'error': 'No image provided'}, status=400)
        
        # Get file extension
        ext = os.path.splitext(image_file.name)[1].lower()
        if ext not in ['.jpg', '.jpeg', '.png']:
            return JsonResponse({'error': 'Invalid file format'}, status=400)
        
        # Create filename using username
        filename = f"{request.user.username}{ext}"
        
        # Full path
        filepath = os.path.join(settings.MEDIA_ROOT, 'profile_images', filename)
        
        # Remove old image if exists
        if request.user.profile_image:
            old_path = request.user.profile_image.path
            if os.path.exists(old_path):
                os.remove(old_path)
        
        # Save new image
        request.user.profile_image.save(filename, image_file, save=True)
        request.user.save()  # Force save the user object
        
        # Generate a cache-busting URL
        image_url = f"{request.user.profile_image.url}?v={int(time.time())}"
        
        return JsonResponse({
            'success': True,
            'image_url': image_url
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@require_http_methods(["POST"])
def capture_profile_image(request):
    try:
        # Get base64 image data
        image_data = request.POST.get('image')
        if not image_data:
            return JsonResponse({'error': 'No image data provided'}, status=400)
        
        # Remove data URL prefix
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        # Convert to image
        image_bytes = base64.b64decode(image_data)
        img = Image.open(BytesIO(image_bytes))
        
        # Create filename
        filename = f"{request.user.username}.jpg"
        
        # Remove old image if exists
        if request.user.profile_image:
            old_path = request.user.profile_image.path
            if os.path.exists(old_path):
                os.remove(old_path)
        
        # Process and save new image
        output = BytesIO()
        # Convert to RGB if image is in RGBA mode
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        img.save(output, format='JPEG', quality=85)
        output.seek(0)
        
        request.user.profile_image.save(filename, output, save=True)
        
        return JsonResponse({
            'success': True,
            'image_url': request.user.profile_image.url
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

