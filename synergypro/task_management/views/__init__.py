from .auth_views import home, login_view, signup_view, logout_view
from .contact_views import submit_query
from .auth_views import *
from .dashboard_views import *
from .contact_views import *

__all__ = [
    'home',
    'login_view',
    'signup_view',
    'logout_view',
    'submit_query'
]