from django.db import models
from django.contrib.auth.models import User

class Client(models.Model):
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='clients'
    )
    name = models.CharField(max_length=255)
    contact_email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.owner.username})"
    
    class Meta:
        indexes = [
            models.Index(fields=['owner', 'created_at']),
        ]

class Worker(models.Model):
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='workers'
    )
    name = models.CharField(max_length=255)
    skills = models.TextField(blank=True, null=True)
    availability = models.CharField(max_length=100, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.owner.username})"

class Task(models.Model):
    STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
        ('BLOCKED', 'Blocked'),
    ]

    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='tasks'
    )
    description = models.JSONField(default=list, blank=True)
    due_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO')
    assigned_worker = models.ForeignKey(Worker, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Task {self.id} ({self.owner.username})"
    
    class Meta:
        indexes = [
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['owner', 'due_date']),
        ]