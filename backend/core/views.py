from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.http import JsonResponse
from .models import Client, Worker, Task
from .serializers import ClientSerializer, WorkerSerializer, TaskSerializer, UserSerializer

# ==================== AUTHENTICATION ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Get CSRF token for the session"""
    return Response({'csrfToken': get_token(request)})

@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """Handle user login"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Authenticate user
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        if user.is_active:
            login(request, user)
            
            # Get user data to return to frontend
            user_data = UserSerializer(user).data
            
            return Response({
                'message': 'Login successful',
                'user': user_data,
                'sessionid': request.session.session_key
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Account is disabled'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    else:
        return Response(
            {'error': 'Invalid username or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    """Handle user logout"""
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    """Check if user is authenticated and return user data"""
    user_data = UserSerializer(request.user).data
    return Response({
        'authenticated': True,
        'user': user_data
    })

# ==================== USER-AWARE VIEWSETS ====================

class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return only clients belonging to the current user
        return Client.objects.filter(owner=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        # Automatically assign the current user as owner
        serializer.save(owner=self.request.user)

class WorkerViewSet(viewsets.ModelViewSet):
    serializer_class = WorkerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return only workers belonging to the current user
        return Worker.objects.filter(owner=self.request.user).order_by('name')
    
    def perform_create(self, serializer):
        # Automatically assign the current user as owner
        serializer.save(owner=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Return tasks belonging to the current user
        Include related clients and workers for performance
        """
        user = self.request.user
        return Task.objects.filter(owner=user)\
            .select_related('client', 'assigned_worker')\
            .order_by('-updated_at')
    
    def perform_create(self, serializer):
        # Automatically assign the current user as owner
        serializer.save(owner=self.request.user)
    
    def get_serializer_context(self):
        """
        Provide context to serializer to filter related objects
        by current user
        """
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Analytics endpoint for the current user"""
        user = request.user
        
        # Get counts
        total_tasks = Task.objects.filter(owner=user).count()
        completed_tasks = Task.objects.filter(owner=user, status='DONE').count()
        todo_tasks = Task.objects.filter(owner=user, status='TODO').count()
        in_progress_tasks = Task.objects.filter(owner=user, status='IN_PROGRESS').count()
        
        # Client statistics
        clients = Client.objects.filter(owner=user)
        client_stats = []
        for client in clients:
            task_count = Task.objects.filter(owner=user, client=client).count()
            if task_count > 0:
                client_stats.append({
                    'name': client.name,
                    'task_count': task_count
                })
        
        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'todo_tasks': todo_tasks,
            'in_progress_tasks': in_progress_tasks,
            'clients': client_stats[:10],  # Top 10 clients
            'user': UserSerializer(user).data
        })

# ==================== ADMIN MANAGEMENT ====================

#@api_view(['POST'])
#@permission_classes([AllowAny])
#def create_initial_admin(request):
    """
    Endpoint to create initial admin user (for development only)
    PROTECT THIS IN PRODUCTION!
    """
    # Remove or protect this in production
#    if User.objects.filter(username='username').exists():
#        return Response({'message': 'User already exists'})
    
#    user = User.objects.create_user(
#        username='username',
#        password='your_password_here',  # Change this!
#        email='email@example.com',
#        is_staff=True,
#        is_superuser=True
#    )
    
#    return Response({'message': f'User {user.username} created'})