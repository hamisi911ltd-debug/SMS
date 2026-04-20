"""
Script to delete all data except admin users
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from students.models import Student
from teachers.models import Teacher
from academics.models import Class, Subject, Exam, Result, Homework, Timetable
from attendance.models import Attendance
from finance.models import FeeStructure, Payment, Invoice
from messaging.models import Message, Notification
from dashboard.models import ActivityLog, DashboardWidget, UserDashboard

def clear_data():
    print("Starting data cleanup...")
    print("=" * 60)
    
    # Delete students
    student_count = Student.objects.count()
    Student.objects.all().delete()
    print(f"✓ Deleted {student_count} students")
    
    # Delete teachers
    teacher_count = Teacher.objects.count()
    Teacher.objects.all().delete()
    print(f"✓ Deleted {teacher_count} teachers")
    
    # Delete academic data
    result_count = Result.objects.count()
    Result.objects.all().delete()
    print(f"✓ Deleted {result_count} results")
    
    homework_count = Homework.objects.count()
    Homework.objects.all().delete()
    print(f"✓ Deleted {homework_count} homework assignments")
    
    exam_count = Exam.objects.count()
    Exam.objects.all().delete()
    print(f"✓ Deleted {exam_count} exams")
    
    timetable_count = Timetable.objects.count()
    Timetable.objects.all().delete()
    print(f"✓ Deleted {timetable_count} timetable entries")
    
    subject_count = Subject.objects.count()
    Subject.objects.all().delete()
    print(f"✓ Deleted {subject_count} subjects")
    
    class_count = Class.objects.count()
    Class.objects.all().delete()
    print(f"✓ Deleted {class_count} classes")
    
    # Delete attendance
    attendance_count = Attendance.objects.count()
    Attendance.objects.all().delete()
    print(f"✓ Deleted {attendance_count} attendance records")
    
    # Delete finance data
    payment_count = Payment.objects.count()
    Payment.objects.all().delete()
    print(f"✓ Deleted {payment_count} payments")
    
    invoice_count = Invoice.objects.count()
    Invoice.objects.all().delete()
    print(f"✓ Deleted {invoice_count} invoices")
    
    fee_count = FeeStructure.objects.count()
    FeeStructure.objects.all().delete()
    print(f"✓ Deleted {fee_count} fee structures")
    
    # Delete messaging data
    message_count = Message.objects.count()
    Message.objects.all().delete()
    print(f"✓ Deleted {message_count} messages")
    
    notification_count = Notification.objects.count()
    Notification.objects.all().delete()
    print(f"✓ Deleted {notification_count} notifications")
    
    # Delete announcements and dashboard data
    activity_count = ActivityLog.objects.count()
    ActivityLog.objects.all().delete()
    print(f"✓ Deleted {activity_count} activity logs")
    
    dashboard_count = UserDashboard.objects.count()
    UserDashboard.objects.all().delete()
    print(f"✓ Deleted {dashboard_count} user dashboards")
    
    # Delete non-admin users
    non_admin_users = User.objects.filter(is_superuser=False, is_staff=False)
    non_admin_count = non_admin_users.count()
    non_admin_users.delete()
    print(f"✓ Deleted {non_admin_count} non-admin users")
    
    print("=" * 60)
    print("✅ Data cleanup complete!")
    print(f"\n📊 Remaining admin users: {User.objects.filter(is_superuser=True).count()}")
    print("\nAdmin users preserved:")
    for admin in User.objects.filter(is_superuser=True):
        print(f"  - {admin.username} ({admin.email})")

if __name__ == '__main__':
    confirm = input("⚠️  This will delete ALL data except admin users. Are you sure? (yes/no): ")
    if confirm.lower() == 'yes':
        clear_data()
    else:
        print("Operation cancelled.")
