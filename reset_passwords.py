#!/usr/bin/env python
"""Reset passwords for default users"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

print("=" * 60)
print("RESETTING USER PASSWORDS")
print("=" * 60)

# Reset admin password
try:
    admin = User.objects.get(username='kenyan')
    admin.set_password('38624586')
    admin.is_superuser = True
    admin.is_staff = True
    admin.role = 'admin'
    admin.save()
    print(f"✓ Admin user 'kenyan' password reset to: 38624586")
except User.DoesNotExist:
    print("✗ Admin user 'kenyan' not found")

# Check for 'eugen' user
try:
    eugen = User.objects.get(username='eugen')
    eugen.set_password('38624586')
    eugen.is_superuser = True
    eugen.is_staff = True
    eugen.role = 'admin'
    eugen.save()
    print(f"✓ Admin user 'eugen' password reset to: 38624586")
except User.DoesNotExist:
    # Create eugen user
    eugen = User.objects.create_user(
        username='eugen',
        email='eugen@school.com',
        password='38624586',
        first_name='Eugen',
        last_name='Admin',
        role='admin',
        is_superuser=True,
        is_staff=True
    )
    print(f"✓ Admin user 'eugen' created with password: 38624586")

# Reset teacher password
try:
    teacher = User.objects.get(username='john.teacher')
    teacher.set_password('Mwangi@2024!')
    teacher.role = 'teacher'
    teacher.save()
    print(f"✓ Teacher 'john.teacher' password reset to: Mwangi@2024!")
except User.DoesNotExist:
    print("✗ Teacher 'john.teacher' not found")

# Reset student password
try:
    student = User.objects.get(username='james.student')
    student.set_password('Odhiambo@2024')
    student.role = 'student'
    student.save()
    print(f"✓ Student 'james.student' password reset to: Odhiambo@2024")
except User.DoesNotExist:
    print("✗ Student 'james.student' not found")

print("\n" + "=" * 60)
print("PASSWORD RESET COMPLETE!")
print("=" * 60)
print("\nLOGIN CREDENTIALS:")
print("-" * 60)
print("Admin:")
print("  Username: eugen")
print("  Password: 38624586")
print("  URL: http://127.0.0.1:8000/admin/")
print()
print("Teacher:")
print("  Username: john.teacher")
print("  Password: Mwangi@2024!")
print("  URL: http://127.0.0.1:8000/")
print()
print("Student:")
print("  Username: james.student")
print("  Password: Odhiambo@2024")
print("  URL: http://127.0.0.1:8000/")
print("=" * 60)

# Test authentication
from django.contrib.auth import authenticate

print("\nTESTING AUTHENTICATION:")
print("-" * 60)

test_users = [
    ('eugen', '38624586', 'Admin'),
    ('john.teacher', 'Mwangi@2024!', 'Teacher'),
    ('james.student', 'Odhiambo@2024', 'Student'),
]

for username, password, role in test_users:
    auth = authenticate(username=username, password=password)
    if auth:
        print(f"✓ {role} login works: {username}")
    else:
        print(f"✗ {role} login FAILED: {username}")

print("=" * 60)
