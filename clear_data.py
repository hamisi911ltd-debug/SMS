#!/usr/bin/env python
"""Clear all data except user accounts"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from students.models import (
    Student, Parent, StudentDocument, Club, ClubMembership, 
    Sport, SportParticipation, StudentNote, Sibling
)
from teachers.models import (
    Teacher, TeacherQualification, TeacherSubject, TeacherClass,
    TeacherLeave, TeacherAttendance, TeacherDocument, TeacherPerformance,
    TeacherSalary, TeacherTraining, TeacherAward, TeacherNote
)
from academics.models import (
    AcademicYear, Term, SubjectCategory, Subject, Class, SubjectAllocation,
    Exam, ExamSchedule, Result, ResultSummary, Timetable, LessonPlan,
    Homework, HomeworkSubmission
)
from finance.models import *
from attendance.models import *
from messaging.models import *
from reports.models import *
from accounts.models import Notification, AuditLog, LoginLog

print("=" * 70)
print("CLEARING ALL DATA (KEEPING USER ACCOUNTS)")
print("=" * 70)

# Delete in order to respect foreign key constraints

# Finance FIRST (has foreign keys to academic year)
print("\n💰 Clearing Finance Data...")
try:
    from finance.models import Payment, Invoice, FeeStructure, Expense, Budget
    Payment.objects.all().delete()
    print(f"  ✓ Deleted payments")
    Invoice.objects.all().delete()
    print(f"  ✓ Deleted invoices")
    FeeStructure.objects.all().delete()
    print(f"  ✓ Deleted fee structures")
    Expense.objects.all().delete()
    print(f"  ✓ Deleted expenses")
    Budget.objects.all().delete()
    print(f"  ✓ Deleted budgets")
except Exception as e:
    print(f"  ⚠ Finance: {e}")

# Academics
print("\n📚 Clearing Academic Data...")
HomeworkSubmission.objects.all().delete()
print(f"  ✓ Deleted homework submissions")
Homework.objects.all().delete()
print(f"  ✓ Deleted homework assignments")
LessonPlan.objects.all().delete()
print(f"  ✓ Deleted lesson plans")
Timetable.objects.all().delete()
print(f"  ✓ Deleted timetables")
ResultSummary.objects.all().delete()
print(f"  ✓ Deleted result summaries")
Result.objects.all().delete()
print(f"  ✓ Deleted exam results")
ExamSchedule.objects.all().delete()
print(f"  ✓ Deleted exam schedules")
Exam.objects.all().delete()
print(f"  ✓ Deleted exams")
SubjectAllocation.objects.all().delete()
print(f"  ✓ Deleted subject allocations")
Class.objects.all().delete()
print(f"  ✓ Deleted classes")
Subject.objects.all().delete()
print(f"  ✓ Deleted subjects")
SubjectCategory.objects.all().delete()
print(f"  ✓ Deleted subject categories")
Term.objects.all().delete()
print(f"  ✓ Deleted terms")
AcademicYear.objects.all().delete()
print(f"  ✓ Deleted academic years")

# Teachers
print("\n👨‍🏫 Clearing Teacher Data...")
TeacherNote.objects.all().delete()
TeacherAward.objects.all().delete()
TeacherTraining.objects.all().delete()
TeacherSalary.objects.all().delete()
TeacherPerformance.objects.all().delete()
TeacherDocument.objects.all().delete()
TeacherAttendance.objects.all().delete()
TeacherLeave.objects.all().delete()
TeacherClass.objects.all().delete()
TeacherSubject.objects.all().delete()
TeacherQualification.objects.all().delete()
print(f"  ✓ Deleted {Teacher.objects.all().delete()[0]} teacher profiles")

# Students
print("\n👨‍🎓 Clearing Student Data...")
Sibling.objects.all().delete()
StudentNote.objects.all().delete()
SportParticipation.objects.all().delete()
Sport.objects.all().delete()
ClubMembership.objects.all().delete()
Club.objects.all().delete()
StudentDocument.objects.all().delete()
Parent.objects.all().delete()
print(f"  ✓ Deleted {Student.objects.all().delete()[0]} student profiles")

# Finance already deleted above

# Attendance
print("\n📅 Clearing Attendance Data...")
try:
    from attendance.models import Attendance, AttendanceSession, Holiday
    Attendance.objects.all().delete()
    AttendanceSession.objects.all().delete()
    Holiday.objects.all().delete()
    print(f"  ✓ Deleted all attendance records")
except Exception as e:
    print(f"  ⚠ Attendance: {e}")

# Messaging
print("\n💬 Clearing Messaging Data...")
try:
    from messaging.models import Message, Conversation, Announcement
    Message.objects.all().delete()
    Conversation.objects.all().delete()
    Announcement.objects.all().delete()
    print(f"  ✓ Deleted all messages")
except Exception as e:
    print(f"  ⚠ Messaging: {e}")

# Reports
print("\n📊 Clearing Reports Data...")
try:
    from reports.models import Report
    Report.objects.all().delete()
    print(f"  ✓ Deleted all reports")
except Exception as e:
    print(f"  ⚠ Reports: {e}")

# Notifications and Logs
print("\n🔔 Clearing Notifications and Logs...")
Notification.objects.all().delete()
print(f"  ✓ Deleted notifications")
AuditLog.objects.all().delete()
print(f"  ✓ Deleted audit logs")
LoginLog.objects.all().delete()
print(f"  ✓ Deleted login logs")

print("\n" + "=" * 70)
print("✅ DATA CLEARING COMPLETE!")
print("=" * 70)

# Show what's left
from accounts.models import User
print(f"\n📊 Remaining Data:")
print(f"  • Users: {User.objects.count()}")
print(f"  • Students: {Student.objects.count()}")
print(f"  • Teachers: {Teacher.objects.count()}")
print(f"  • Academic Years: {AcademicYear.objects.count()}")
print(f"  • All other data: CLEARED ✓")

print("\n" + "=" * 70)
print("USER ACCOUNTS PRESERVED:")
print("=" * 70)
for user in User.objects.all()[:10]:
    print(f"  • {user.username} ({user.role})")
if User.objects.count() > 10:
    print(f"  ... and {User.objects.count() - 10} more users")

print("\n✅ System is now clean and ready for Glotech High School!")
print("=" * 70)
