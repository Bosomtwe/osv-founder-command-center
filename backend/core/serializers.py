from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Client, Worker, Task

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name', 'contact_email', 'phone', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = ['id', 'name', 'skills', 'availability', 'contact_email', 'created_at']
        read_only_fields = ['id', 'created_at']

class TaskSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    assigned_worker = WorkerSerializer(read_only=True)
    
    # For writing/updating
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        source='client',
        write_only=True,
        allow_null=True,
        required=False
    )
    
    assigned_worker_id = serializers.PrimaryKeyRelatedField(
        queryset=Worker.objects.all(),
        source='assigned_worker',
        write_only=True,
        allow_null=True,
        required=False
    )
    
    owner = UserSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='owner',
        write_only=True,
        required=False
    )

    class Meta:
        model = Task
        fields = [
            'id', 'description', 'due_date', 'status', 'notes',
            'created_at', 'updated_at',
            'client', 'client_id',
            'assigned_worker', 'assigned_worker_id',
            'owner', 'owner_id'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']