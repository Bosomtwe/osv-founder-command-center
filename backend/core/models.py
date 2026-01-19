from django.db import models

# Create your models here.
class Client(models.Model):
    name = models.CharField(max_length=255)
    contact_email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Worker(models.Model):
    name = models.CharField(max_length=255)
    skills = models.TextField(blank=True, null=True)  # e.g., comma-separated
    availability = models.CharField(max_length=100, blank=True, null=True)  # e.g., "Full-time"
    contact_email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Task(models.Model):
    STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
        ('BLOCKED', 'Blocked'),
    ]

    description = models.TextField()
    due_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO')
    assigned_worker = models.ForeignKey(Worker, on_delete=models.SET_NULL, null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True)  # Optional link to client
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Task: {self.description[:50]}"
