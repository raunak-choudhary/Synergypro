from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def individual_student_dashboard(request):
    return render(request, 'task_management/dashboard/student.html')