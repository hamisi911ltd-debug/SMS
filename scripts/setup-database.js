const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function setupDatabase() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glotech_school';
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Create default admin user
        const adminExists = await User.findOne({ role: 'admin' });
        
        if (!adminExists) {
            const admin = new User({
                username: 'admin',
                email: 'admin@glotechhigh.ac.ke',
                password: 'admin123',
                firstName: 'System',
                lastName: 'Administrator',
                role: 'admin',
                phoneNumber: '+254700000000',
                isActive: true,
                emailVerified: true
            });

            await admin.save();
            console.log('✅ Default admin user created');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            console.log('   ⚠️  Please change the password after first login!');
        } else {
            console.log('✅ Admin user already exists');
        }

        // Create sample teacher
        const teacherExists = await User.findOne({ role: 'teacher' });
        
        if (!teacherExists) {
            const teacher = new User({
                username: 'john.teacher',
                email: 'john.teacher@glotechhigh.ac.ke',
                password: 'teacher123',
                firstName: 'John',
                lastName: 'Kamau',
                role: 'teacher',
                phoneNumber: '+254712345678',
                isActive: true,
                emailVerified: true
            });

            await teacher.save();
            console.log('✅ Sample teacher created');
            console.log('   Username: john.teacher');
            console.log('   Password: teacher123');
        }

        // Create sample student
        const studentExists = await User.findOne({ role: 'student' });
        
        if (!studentExists) {
            const student = new User({
                username: 'jane.student',
                email: 'jane.student@glotechhigh.ac.ke',
                password: 'student123',
                firstName: 'Jane',
                lastName: 'Wanjiku',
                role: 'student',
                phoneNumber: '+254723456789',
                isActive: true,
                emailVerified: true
            });

            await student.save();
            console.log('✅ Sample student created');
            console.log('   Username: jane.student');
            console.log('   Password: student123');
        }

        console.log('✅ Database setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Database setup error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;