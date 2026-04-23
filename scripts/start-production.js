const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function startProduction() {
    try {
        console.log('🚀 Starting Glotech School Management System...');
        
        // Check if MongoDB URI is provided
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.log('⚠️  No MONGODB_URI provided. Please set up your database connection.');
            console.log('📖 See DEPLOYMENT_GUIDE.md for setup instructions.');
            return;
        }

        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Check if admin user exists, create if not
        const adminExists = await User.findOne({ role: 'admin' });
        
        if (!adminExists) {
            console.log('👤 Creating default admin user...');
            
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

        // Create sample users if none exist
        const userCount = await User.countDocuments();
        if (userCount < 3) {
            console.log('👥 Creating sample users...');
            
            // Create teacher
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

            // Create student
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

            await Promise.all([teacher.save(), student.save()]);
            console.log('✅ Sample users created');
        }

        console.log('🎉 Database setup completed successfully!');
        console.log('');
        console.log('📱 Login Credentials:');
        console.log('   Admin: admin / admin123');
        console.log('   Teacher: john.teacher / teacher123');
        console.log('   Student: jane.student / student123');
        console.log('');
        console.log('🌐 Application is ready to start!');
        
    } catch (error) {
        console.error('❌ Production setup error:', error.message);
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('1. Check your MONGODB_URI environment variable');
        console.log('2. Ensure your database is accessible');
        console.log('3. Verify network connectivity');
        console.log('4. See DEPLOYMENT_GUIDE.md for detailed setup');
    } finally {
        await mongoose.disconnect();
    }
}

// Run setup if called directly
if (require.main === module) {
    startProduction();
}

module.exports = startProduction;