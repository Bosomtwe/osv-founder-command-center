from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Client, Worker, Task
from .serializers import ClientSerializer, WorkerSerializer, TaskSerializer
from django.contrib.auth import login, authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import json

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def custom_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
        if user.is_active:
            login(request, user)
            return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Account disabled'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Create your views here.
class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

class WorkerViewSet(viewsets.ModelViewSet):
    queryset = Worker.objects.all().order_by('name')
    serializer_class = WorkerSerializer
    permission_classes = [permissions.IsAuthenticated]

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-updated_at')
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.select_related('client', 'assigned_worker').all()

    # Explicitly allow PATCH (partial update)
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)  # ← partial=True here
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)