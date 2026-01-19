from django.contrib import admin
from .models import Client, Worker, Task

# Register your models here.
@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_email', 'created_at')
    search_fields = ('name',)

@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = ('name', 'skills', 'availability')
    search_fields = ('name',)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('description', 'status', 'assigned_worker', 'client', 'due_date')
    list_filter = ('status', 'assigned_worker')
    search_fields = ('description',)
    autocomplete_fields = ('assigned_worker', 'client')  # For easy selection
