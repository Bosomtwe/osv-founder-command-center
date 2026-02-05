from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientViewSet, WorkerViewSet, TaskViewSet,
    user_login, user_logout, check_auth, get_csrf_token,
    #create_initial_admin
)

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'workers', WorkerViewSet, basename='worker')
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    # Authentication endpoints
    path('auth/csrf/', get_csrf_token, name='get_csrf'),
    path('auth/login/', user_login, name='login'),
    path('auth/logout/', user_logout, name='logout'),
    path('auth/check/', check_auth, name='check_auth'),
    
    # Development endpoint (remove in production)
#    path('auth/create-admin/', create_initial_admin, name='create_admin'),
    
    # API routes
    path('', include(router.urls)),
]