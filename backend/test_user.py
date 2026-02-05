# create_test_user.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Client, Worker, Task

def create_test_user():
    """Create a test user with sample data to test multi-user isolation"""
    
    # Create test user (NOT Raymond)
    test_user, created = User.objects.get_or_create(
        username='alice',
        defaults={
            'email': 'alice@example.com',
            'is_staff': False,
            'is_superuser': False
        }
    )
    
    if created:
        test_user.set_password('alicepassword123')
        test_user.save()
        print(f"✅ Created test user: {test_user.username} (ID: {test_user.id})")
    else:
        print(f"ℹ️  Test user already exists: {test_user.username} (ID: {test_user.id})")
    
    # Check if test user already has data
    if (Client.objects.filter(owner=test_user).exists() or 
        Worker.objects.filter(owner=test_user).exists() or 
        Task.objects.filter(owner=test_user).exists()):
        print("ℹ️  Test user already has data. Skipping creation.")
        return test_user
    
    # Create sample data for test user
    print("\nCreating sample data for test user...")
    
    # Create clients
    client1, _ = Client.objects.get_or_create(
        owner=test_user,
        name="Alice Corp",
        contact_email="alice@alicecorp.com"
    )
    
    client2, _ = Client.objects.get_or_create(
        owner=test_user,
        name="Beta Solutions",
        contact_email="info@betasolutions.com"
    )
    
    # Create workers
    worker1, _ = Worker.objects.get_or_create(
        owner=test_user,
        name="Bob Tester",
        skills="QA, Testing, Automation",
        availability="Full-time"
    )
    
    worker2, _ = Worker.objects.get_or_create(
        owner=test_user,
        name="Charlie Manager",
        skills="Project Management, Agile",
        availability="Part-time"
    )
    
    # Create tasks
    task1, _ = Task.objects.get_or_create(
        owner=test_user,
        description=[{"type": "paragraph", "content": [{"type": "text", "text": "Test user isolation"}]}],
        status="TODO",
        client=client1,
        assigned_worker=worker1
    )
    
    task2, _ = Task.objects.get_or_create(
        owner=test_user,
        description=[{"type": "paragraph", "content": [{"type": "text", "text": "Review dashboard permissions"}]}],
        status="IN_PROGRESS",
        client=client2,
        assigned_worker=worker2
    )
    
    print("✅ Sample data created for test user!")
    print(f"\nCreated for {test_user.username}:")
    print(f"  - Clients: {client1.name}, {client2.name}")
    print(f"  - Workers: {worker1.name}, {worker2.name}")
    print(f"  - Tasks: {task1.id}, {task2.id}")
    
    return test_user

def check_data_isolation():
    """Verify that users can only see their own data"""
    
    print("\n" + "="*50)
    print("DATA ISOLATION VERIFICATION")
    print("="*50)
    
    # Get users
    try:
        raymond = User.objects.get(username='Raymond')
        print(f"Raymond: ID={raymond.id}")
    except User.DoesNotExist:
        print("❌ Raymond not found!")
        return
    
    try:
        alice = User.objects.get(username='alice')
        print(f"Alice: ID={alice.id}")
    except User.DoesNotExist:
        print("❌ Alice not found. Run create_test_user() first.")
        return
    
    print(f"\n📊 Data Counts:")
    print(f"Raymond's data:")
    print(f"  Clients: {Client.objects.filter(owner=raymond).count()}")
    print(f"  Workers: {Worker.objects.filter(owner=raymond).count()}")
    print(f"  Tasks: {Task.objects.filter(owner=raymond).count()}")
    
    print(f"\nAlice's data:")
    print(f"  Clients: {Client.objects.filter(owner=alice).count()}")
    print(f"  Workers: {Worker.objects.filter(owner=alice).count()}")
    print(f"  Tasks: {Task.objects.filter(owner=alice).count()}")
    
    print(f"\n📈 Totals:")
    print(f"  Total clients: {Client.objects.count()}")
    print(f"  Total workers: {Worker.objects.count()}")
    print(f"  Total tasks: {Task.objects.count()}")
    
    # Verify sums match
    raymond_clients = Client.objects.filter(owner=raymond).count()
    alice_clients = Client.objects.filter(owner=alice).count()
    total_clients = Client.objects.count()
    
    if raymond_clients + alice_clients == total_clients:
        print("✅ Client isolation verified!")
    else:
        print("❌ Client isolation issue! Some clients may have wrong/no owner.")

if __name__ == "__main__":
    print("Creating test user and data...")
    create_test_user()
    check_data_isolation()