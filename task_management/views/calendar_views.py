from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def calendar_view(request):
    context = {
        'user': request.user,
    }
    return render(request, 'task_management/dashboard/calendar.html', context)