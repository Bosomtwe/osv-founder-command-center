from rest_framework import serializers
from .models import Client, Worker, Task

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name', 'contact_email', 'phone', 'notes', 'created_at']
        read_only_fields = ['created_at']

class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = ['id', 'name', 'skills', 'availability', 'contact_email', 'created_at']
        read_only_fields = ['created_at']

class TaskSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(), source='client', write_only=True, allow_null=True
    )
    assigned_worker = WorkerSerializer(read_only=True)
    assigned_worker_id = serializers.PrimaryKeyRelatedField(
        queryset=Worker.objects.all(), source='assigned_worker', write_only=True, allow_null=True
    )

    class Meta:
        model = Task
        fields = [
            'id', 'description', 'due_date', 'status', 'notes',
            'created_at', 'updated_at',
            'client', 'client_id',
            'assigned_worker', 'assigned_worker_id'
        ]
        read_only_fields = ['created_at', 'updated_at']