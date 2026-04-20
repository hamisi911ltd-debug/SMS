"""
Comprehensive test data population script
Creates at least 5 entries for all major categories
"""
import os
import django
import random
from datetime import datetime, date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import User
from students.models import Student, Parent, Club, Sport, ClubMembership, SportParticipation
from teachers.models import Teacher, TeacherSubject, TeacherClass
from academics.models import (
    AcademicYear, Term, SubjectCategory, Subject, Class, 
    SubjectAllocation, Exam, Result, Timetable, Homework
)
from finance.models import (
    FeeCategory, FeeStructure, Invoice, Payment, 
    ExpenseCategory, Expense, FinancialAid
)
from attendance.models import Attendance

User = get_user_model()

# Kenyan names for realistic data
FIRST_NAMES_MALE = ['James', 'John', 'David', 'Peter', 'Michael', 'Joseph', 'Daniel', 'Samuel', 'Brian', 'Kevin']
FIRST_NAMES_FEMALE = ['Mary', 'Jane', 'Grace', 'Faith', 'Lucy', 'Ann', 'Rose', 'Elizabeth', 'Sarah', 'Ruth']
LAST_NAMES = ['Kamau', 'Ochieng', 'Mwangi', 'Otieno', 'Njoroge', 'Wanjiru', 'Kipchoge', 'Achieng', 'Mutua', 'Wafula']

COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Nyeri', 'Machakos', 'Meru', 'Kakamega']

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def create_academic_years():
    print_section("Creating Academic Years")
    
    years_data = [
        {'name': '2024', 'start': date(2024, 1, 8), 'end': date(2024, 11, 15), 'current': False},
        {'name': '2025', 'start': date(2025, 1, 6), 'end': date(2025, 11, 14), 'current': False},
        {'name': '2026', 'start': date(2026, 1, 5), 'end': date(2026, 11, 13), 'current': True},
        {'name': '2027', 'start': date(2027, 1, 4), 'end': date(2027, 11, 12), 'current': False},
        {'name': '2028', 'start': date(2028, 1, 10), 'end': date(2028, 11, 17), 'current': False},
    ]
    
    academic_years = []
    for data in years_data:
        year, created = AcademicYear.objects.get_or_create(
            name=data['name'],
            defaults={
                'start_date': data['start'],
                'end_date': data['end'],
                'is_current': data['current']
            }
        )
        academic_years.append(year)
        print(f"✓ Created: {year.name} {'(Current)' if year.is_current else ''}")
    
    return academic_years

def create_terms(academic_years):
    print_section("Creating Terms")
    
    current_year = [y for y in academic_years if y.is_current][0]
    
    terms_data = [
        {'term': 1, 'start': date(2026, 1, 5), 'end': date(2026, 4, 10), 'current': False},
        {'term': 2, 'start': date(2026, 5, 4), 'end': date(2026, 8, 7), 'current': True},
        {'term': 3, 'start': date(2026, 9, 7), 'end': date(2026, 11, 13), 'current': False},
    ]
    
    terms = []
    for data in terms_data:
        term, created = Term.objects.get_or_create(
            academic_year=current_year,
            term=data['term'],
            defaults={
                'start_date': data['start'],
                'end_date': data['end'],
                'is_current': data['current']
            }
        )
        terms.append(term)
        print(f"✓ Created: {term} {'(Current)' if term.is_current else ''}")
    
    return terms

def create_subject_categories():
    print_section("Creating Subject Categories")
    
    categories_data = [
        {'name': 'Sciences', 'code': 'SCI', 'desc': 'Science subjects'},
        {'name': 'Languages', 'code': 'LANG', 'desc': 'Language subjects'},
        {'name': 'Humanities', 'code': 'HUM', 'desc': 'Humanities and social sciences'},
        {'name': 'Mathematics', 'code': 'MATH', 'desc': 'Mathematics subjects'},
        {'name': 'Technical', 'code': 'TECH', 'desc': 'Technical and applied subjects'},
        {'name': 'Arts', 'code': 'ARTS', 'desc': 'Creative arts subjects'},
    ]
    
    categories = []
    for data in categories_data:
        try:
            cat = SubjectCategory.objects.get(code=data['code'])
            print(f"✓ Exists: {cat.name}")
        except SubjectCategory.DoesNotExist:
            try:
                cat = SubjectCategory.objects.get(name=data['name'])
                print(f"✓ Exists: {cat.name}")
            except SubjectCategory.DoesNotExist:
                cat = SubjectCategory.objects.create(
                    code=data['code'],
                    name=data['name'],
                    description=data['desc']
                )
                print(f"✓ Created: {cat.name}")
        categories.append(cat)
    
    return categories

def create_subjects(categories):
    print_section("Creating Subjects")
    
    subjects_data = [
        {'name': 'Mathematics', 'code': 'MATH', 'category': 'MATH', 'type': 'compulsory'},
        {'name': 'English', 'code': 'ENG', 'category': 'LANG', 'type': 'compulsory'},
        {'name': 'Kiswahili', 'code': 'KIS', 'category': 'LANG', 'type': 'compulsory'},
        {'name': 'Biology', 'code': 'BIO', 'category': 'SCI', 'type': 'compulsory'},
        {'name': 'Chemistry', 'code': 'CHEM', 'category': 'SCI', 'type': 'elective'},
        {'name': 'Physics', 'code': 'PHY', 'category': 'SCI', 'type': 'elective'},
        {'name': 'History', 'code': 'HIST', 'category': 'HUM', 'type': 'elective'},
        {'name': 'Geography', 'code': 'GEO', 'category': 'HUM', 'type': 'elective'},
        {'name': 'CRE', 'code': 'CRE', 'category': 'HUM', 'type': 'elective'},
        {'name': 'Business Studies', 'code': 'BST', 'category': 'HUM', 'type': 'elective'},
        {'name': 'Computer Studies', 'code': 'COMP', 'category': 'TECH', 'type': 'elective'},
        {'name': 'Agriculture', 'code': 'AGR', 'category': 'TECH', 'type': 'elective'},
    ]
    
    cat_dict = {c.code: c for c in categories}
    subjects = []
    
    for data in subjects_data:
        subj, created = Subject.objects.get_or_create(
            code=data['code'],
            defaults={
                'name': data['name'],
                'category': cat_dict.get(data['category']),
                'subject_type': data['type'],
                'classes': [1, 2, 3, 4],
                'pass_mark': 40,
                'max_mark': 100
            }
        )
        subjects.append(subj)
        print(f"✓ Created: {subj.name} ({subj.code})")
    
    return subjects

def create_teachers():
    print_section("Creating Teachers (10 teachers)")
    
    teachers_data = [
        {'first': 'John', 'last': 'Kamau', 'gender': 'M', 'qual': 'bachelors', 'spec': 'Mathematics'},
        {'first': 'Mary', 'last': 'Wanjiru', 'gender': 'F', 'qual': 'masters', 'spec': 'English Literature'},
        {'first': 'Peter', 'last': 'Ochieng', 'gender': 'M', 'qual': 'bachelors', 'spec': 'Chemistry'},
        {'first': 'Grace', 'last': 'Achieng', 'gender': 'F', 'qual': 'bachelors', 'spec': 'Biology'},
        {'first': 'David', 'last': 'Kipchoge', 'gender': 'M', 'qual': 'masters', 'spec': 'Physics'},
        {'first': 'Faith', 'last': 'Njoroge', 'gender': 'F', 'qual': 'bachelors', 'spec': 'Kiswahili'},
        {'first': 'James', 'last': 'Mutua', 'gender': 'M', 'qual': 'bachelors', 'spec': 'History & Government'},
        {'first': 'Lucy', 'last': 'Wafula', 'gender': 'F', 'qual': 'bachelors', 'spec': 'Geography'},
        {'first': 'Michael', 'last': 'Otieno', 'gender': 'M', 'qual': 'diploma', 'spec': 'Computer Science'},
        {'first': 'Sarah', 'last': 'Mwangi', 'gender': 'F', 'qual': 'bachelors', 'spec': 'Business Studies'},
    ]
    
    teachers = []
    for idx, data in enumerate(teachers_data, 1):
        username = f"{data['first'].lower()}.{data['last'].lower()}"
        email = f"{username}@glotechhigh.ac.ke"
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': data['first'],
                'last_name': data['last'],
                'role': 'teacher',
                'is_active': True,
                'phone_number': f"07{random.randint(10000000, 99999999)}"
            }
        )
        if created:
            user.set_password('Teacher@2024')
            user.save()
        
        teacher, created = Teacher.objects.get_or_create(
            user=user,
            defaults={
                'employee_number': f"EMP{2020+idx:04d}",
                'tsc_number': f"TSC{random.randint(100000, 999999)}",
                'id_number': f"{random.randint(10000000, 39999999)}",
                'date_of_birth': date(1980 + random.randint(0, 15), random.randint(1, 12), random.randint(1, 28)),
                'gender': data['gender'],
                'qualification_level': data['qual'],
                'qualifications': f"{data['qual'].title()} in {data['spec']}",
                'specialization': data['spec'],
                'years_of_experience': random.randint(2, 15),
                'date_employed': date(2015 + random.randint(0, 8), random.randint(1, 12), 1),
                'employment_type': 'permanent',
                'phone_number': user.phone_number,
                'email': email,
                'emergency_contact_name': f"{random.choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)} {random.choice(LAST_NAMES)}",
                'emergency_contact_phone': f"07{random.randint(10000000, 99999999)}",
                'emergency_contact_relationship': random.choice(['Spouse', 'Parent', 'Sibling']),
            }
        )
        teachers.append(teacher)
        print(f"✓ Created: {teacher.get_full_name()} - {teacher.specialization}")
    
    return teachers

def create_classes(academic_years, teachers):
    print_section("Creating Classes")
    
    current_year = [y for y in academic_years if y.is_current][0]
    streams = ['East', 'West', 'North', 'South']
    
    classes = []
    teacher_idx = 0
    
    for level in [1, 2, 3, 4]:
        for stream in streams:
            cls, created = Class.objects.get_or_create(
                class_level=level,
                stream=stream,
                academic_year=current_year,
                defaults={
                    'class_teacher': teachers[teacher_idx % len(teachers)],
                    'capacity': 45
                }
            )
            classes.append(cls)
            print(f"✓ Created: {cls}")
            teacher_idx += 1
    
    return classes

def create_students(classes):
    print_section("Creating Students (50 students)")
    
    students = []
    admission_start = 1001
    
    for idx in range(50):
        # Randomly select gender and names
        gender = random.choice(['M', 'F'])
        first_name = random.choice(FIRST_NAMES_MALE if gender == 'M' else FIRST_NAMES_FEMALE)
        last_name = random.choice(LAST_NAMES)
        
        # Select a class
        selected_class = random.choice(classes)
        
        username = f"{first_name.lower()}.{last_name.lower()}{idx}"
        email = f"{username}@student.glotechhigh.ac.ke"
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'role': 'student',
                'is_active': True,
                'phone_number': f"07{random.randint(10000000, 99999999)}"
            }
        )
        if created:
            user.set_password('Student@2024')
            user.save()
        
        parent_name = f"{random.choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)} {last_name}"
        
        student, created = Student.objects.get_or_create(
            user=user,
            defaults={
                'admission_number': f"ADM{admission_start + idx}",
                'kcpe_index': f"KCPE{random.randint(100000, 999999)}",
                'kcpe_marks': random.randint(250, 450),
                'date_of_birth': date(2006 + selected_class.class_level, random.randint(1, 12), random.randint(1, 28)),
                'gender': gender,
                'current_class': selected_class.class_level,
                'stream': selected_class.stream,
                'admission_class': 1,
                'year_of_admission': 2023 + (4 - selected_class.class_level),
                'phone_number': user.phone_number,
                'parent_name': parent_name,
                'parent_phone': f"07{random.randint(10000000, 99999999)}",
                'parent_email': f"{parent_name.lower().replace(' ', '.')}@gmail.com",
                'emergency_contact_name': parent_name,
                'emergency_contact_phone': f"07{random.randint(10000000, 99999999)}",
                'emergency_contact_relationship': 'Parent',
                'boarding_status': random.choice(['boarder', 'day_scholar']),
                'physical_address': f"{random.choice(COUNTIES)} County, Kenya",
            }
        )
        students.append(student)
        
        if (idx + 1) % 10 == 0:
            print(f"✓ Created {idx + 1} students...")
    
    print(f"✓ Total students created: {len(students)}")
    return students

def create_subject_allocations(classes, subjects, teachers):
    print_section("Creating Subject Allocations")
    
    allocations = []
    count = 0
    
    for cls in classes:
        # Allocate core subjects to each class
        core_subjects = subjects[:4]  # Math, English, Kiswahili, Biology
        
        for subject in core_subjects:
            # Find a teacher with matching specialization or random
            matching_teachers = [t for t in teachers if subject.name.lower() in t.specialization.lower()]
            teacher = matching_teachers[0] if matching_teachers else random.choice(teachers)
            
            alloc, created = SubjectAllocation.objects.get_or_create(
                class_assigned=cls,
                subject=subject,
                defaults={
                    'teacher': teacher,
                    'lessons_per_week': random.randint(4, 6)
                }
            )
            if created:
                allocations.append(alloc)
                count += 1
        
        # Add some elective subjects
        elective_subjects = random.sample(subjects[4:], 3)
        for subject in elective_subjects:
            matching_teachers = [t for t in teachers if subject.name.lower() in t.specialization.lower()]
            teacher = matching_teachers[0] if matching_teachers else random.choice(teachers)
            
            alloc, created = SubjectAllocation.objects.get_or_create(
                class_assigned=cls,
                subject=subject,
                defaults={
                    'teacher': teacher,
                    'lessons_per_week': random.randint(3, 5)
                }
            )
            if created:
                allocations.append(alloc)
                count += 1
    
    print(f"✓ Created {count} subject allocations")
    return allocations

def create_clubs():
    print_section("Creating Clubs")
    
    clubs_data = [
        {'name': 'Debate Club', 'desc': 'Develop public speaking and critical thinking skills'},
        {'name': 'Science Club', 'desc': 'Explore scientific concepts through experiments'},
        {'name': 'Drama Club', 'desc': 'Theater and performing arts'},
        {'name': 'Music Club', 'desc': 'Choir and instrumental music'},
        {'name': 'Environmental Club', 'desc': 'Environmental conservation and awareness'},
        {'name': 'Journalism Club', 'desc': 'School magazine and news reporting'},
        {'name': 'Mathematics Club', 'desc': 'Advanced mathematics and problem solving'},
    ]
    
    clubs = []
    for data in clubs_data:
        club, created = Club.objects.get_or_create(
            name=data['name'],
            defaults={
                'description': data['desc'],
                'is_active': True
            }
        )
        clubs.append(club)
        print(f"✓ Created: {club.name}")
    
    return clubs

def create_sports():
    print_section("Creating Sports")
    
    sports_data = [
        {'name': 'Football', 'category': 'ball'},
        {'name': 'Basketball', 'category': 'ball'},
        {'name': 'Volleyball', 'category': 'ball'},
        {'name': 'Athletics', 'category': 'athletics'},
        {'name': 'Rugby', 'category': 'ball'},
        {'name': 'Table Tennis', 'category': 'racquet'},
        {'name': 'Swimming', 'category': 'water'},
    ]
    
    sports = []
    for data in sports_data:
        sport, created = Sport.objects.get_or_create(
            name=data['name'],
            defaults={
                'category': data['category'],
                'is_active': True
            }
        )
        sports.append(sport)
        print(f"✓ Created: {sport.name}")
    
    return sports

def create_fee_categories():
    print_section("Creating Fee Categories")
    
    categories_data = [
        {'name': 'Tuition Fee', 'code': 'TUITION', 'optional': False},
        {'name': 'Boarding Fee', 'code': 'BOARDING', 'optional': True},
        {'name': 'Transport Fee', 'code': 'TRANSPORT', 'optional': True},
        {'name': 'Library Fee', 'code': 'LIBRARY', 'optional': False},
        {'name': 'Sports Fee', 'code': 'SPORTS', 'optional': False},
        {'name': 'Medical Fee', 'code': 'MEDICAL', 'optional': False},
    ]
    
    categories = []
    for data in categories_data:
        cat, created = FeeCategory.objects.get_or_create(
            code=data['code'],
            defaults={
                'name': data['name'],
                'is_optional': data['optional']
            }
        )
        categories.append(cat)
        print(f"✓ Created: {cat.name}")
    
    return categories

def create_fee_structures(academic_years):
    print_section("Creating Fee Structures")
    
    current_year = [y for y in academic_years if y.is_current][0]
    
    structures = []
    for term in [1, 2, 3]:
        for class_level in [1, 2, 3, 4]:
            structure, created = FeeStructure.objects.get_or_create(
                academic_year=current_year,
                term=term,
                class_level=class_level,
                defaults={
                    'name': f"Form {class_level} - Term {term} Fees",
                    'tuition_fee': Decimal('25000.00'),
                    'boarding_fee': Decimal('15000.00'),
                    'transport_fee': Decimal('5000.00'),
                    'library_fee': Decimal('1000.00'),
                    'sports_fee': Decimal('1500.00'),
                    'medical_fee': Decimal('2000.00'),
                    'development_fee': Decimal('3000.00'),
                    'other_fees': Decimal('500.00'),
                    'payment_deadline': date(2026, term * 4, 15),
                    'late_payment_penalty': Decimal('500.00')
                }
            )
            if created:
                structures.append(structure)
    
    print(f"✓ Created {len(structures)} fee structures")
    return structures

def create_expense_categories():
    print_section("Creating Expense Categories")
    
    categories_data = [
        {'name': 'Salaries', 'code': 'SAL', 'budget': Decimal('5000000.00')},
        {'name': 'Utilities', 'code': 'UTIL', 'budget': Decimal('500000.00')},
        {'name': 'Maintenance', 'code': 'MAINT', 'budget': Decimal('300000.00')},
        {'name': 'Supplies', 'code': 'SUPP', 'budget': Decimal('400000.00')},
        {'name': 'Transport', 'code': 'TRANS', 'budget': Decimal('200000.00')},
        {'name': 'Events', 'code': 'EVENT', 'budget': Decimal('150000.00')},
    ]
    
    categories = []
    for data in categories_data:
        cat, created = ExpenseCategory.objects.get_or_create(
            code=data['code'],
            defaults={
                'name': data['name'],
                'budget_allocation': data['budget']
            }
        )
        categories.append(cat)
        print(f"✓ Created: {cat.name}")
    
    return categories

def create_exams(terms, subjects):
    print_section("Creating Exams")
    
    current_term = [t for t in terms if t.is_current][0]
    
    exams_data = [
        {'name': 'CAT 1', 'type': 'cat', 'start': date(2026, 5, 10), 'end': date(2026, 5, 14)},
        {'name': 'Mid-Term Exam', 'type': 'midterm', 'start': date(2026, 6, 15), 'end': date(2026, 6, 22)},
        {'name': 'CAT 2', 'type': 'cat', 'start': date(2026, 7, 10), 'end': date(2026, 7, 14)},
        {'name': 'End of Term 2 Exam', 'type': 'endterm', 'start': date(2026, 7, 28), 'end': date(2026, 8, 5)},
    ]
    
    exams = []
    for data in exams_data:
        exam, created = Exam.objects.get_or_create(
            term=current_term,
            name=data['name'],
            defaults={
                'exam_type': data['type'],
                'start_date': data['start'],
                'end_date': data['end'],
                'is_published': True
            }
        )
        if created:
            exam.subjects.set(subjects[:8])  # Add first 8 subjects
            exams.append(exam)
            print(f"✓ Created: {exam.name}")
    
    return exams

def main():
    print("\n" + "="*60)
    print("  COMPREHENSIVE TEST DATA POPULATION")
    print("  Glotech High School Management System")
    print("="*60)
    
    # Create data in order
    academic_years = create_academic_years()
    terms = create_terms(academic_years)
    categories = create_subject_categories()
    subjects = create_subjects(categories)
    teachers = create_teachers()
    classes = create_classes(academic_years, teachers)
    students = create_students(classes)
    allocations = create_subject_allocations(classes, subjects, teachers)
    clubs = create_clubs()
    sports = create_sports()
    fee_categories = create_fee_categories()
    fee_structures = create_fee_structures(academic_years)
    expense_categories = create_expense_categories()
    exams = create_exams(terms, subjects)
    
    # Summary
    print_section("DATA POPULATION SUMMARY")
    print(f"✓ Academic Years: {len(academic_years)}")
    print(f"✓ Terms: {len(terms)}")
    print(f"✓ Subject Categories: {len(categories)}")
    print(f"✓ Subjects: {len(subjects)}")
    print(f"✓ Teachers: {len(teachers)}")
    print(f"✓ Classes: {len(classes)}")
    print(f"✓ Students: {len(students)}")
    print(f"✓ Subject Allocations: {len(allocations)}")
    print(f"✓ Clubs: {len(clubs)}")
    print(f"✓ Sports: {len(sports)}")
    print(f"✓ Fee Categories: {len(fee_categories)}")
    print(f"✓ Fee Structures: {len(fee_structures)}")
    print(f"✓ Expense Categories: {len(expense_categories)}")
    print(f"✓ Exams: {len(exams)}")
    
    print("\n" + "="*60)
    print("  ✅ DATA POPULATION COMPLETE!")
    print("="*60)
    print("\nYou can now:")
    print("  - Log in as any teacher (password: Teacher@2024)")
    print("  - Log in as any student (password: Student@2024)")
    print("  - View classes, subjects, and allocations")
    print("  - Add results, attendance, and more")
    print("="*60 + "\n")

if __name__ == '__main__':
    main()
