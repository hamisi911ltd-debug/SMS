# Glotech High School Management System

A comprehensive school administration system built with Node.js, Express, MongoDB, and modern web technologies.

## Features

### 🎓 Academic Management
- Student enrollment and records management
- Teacher profiles and assignments
- Subject and class management
- Exam scheduling and results processing
- Grade calculation and reporting

### 👥 User Management
- Role-based access control (Admin, Teacher, Student, Parent, Accountant)
- Secure authentication with JWT
- User profiles and preferences
- Password management

### 📊 Attendance System
- Daily attendance marking
- Attendance reports and analytics
- Absenteeism tracking
- Parent notifications

### 💰 Financial Management
- Fee structure management
- Payment processing and tracking
- Financial reports and analytics
- Fee defaulter management
- Invoice generation

### 💬 Communication
- Internal messaging system
- School announcements
- Real-time notifications
- Parent-teacher communication

### 📈 Reports & Analytics
- Academic performance reports
- Attendance analytics
- Financial summaries
- Custom report generation
- Data export capabilities

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Frontend**: Vanilla JavaScript, Tailwind CSS
- **UI Design**: Glassmorphism design system
- **Deployment**: Railway (Production ready)

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd glotech-school-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/glotech_school
   JWT_SECRET=your-super-secret-jwt-key-here
   SESSION_SECRET=your-session-secret-key-here
   NODE_ENV=development
   PORT=3000
   ```

4. **Database Setup**
   ```bash
   npm run setup-db
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Default Login Credentials

After running the database setup, you can use these default accounts:

### Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin (Full system access)

### Teacher
- **Username**: `john.teacher`
- **Password**: `teacher123`
- **Role**: Teacher

### Student
- **Username**: `jane.student`
- **Password**: `student123`
- **Role**: Student

⚠️ **Important**: Change these default passwords after first login!

## Project Structure

```
glotech-school-management/
├── config/                 # Configuration files
├── middleware/            # Express middleware
├── models/               # MongoDB models
├── routes/               # API routes
├── public/               # Static files
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side JavaScript
│   └── images/          # Images and assets
├── scripts/             # Utility scripts
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Student Management
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Deactivate student

### Academic Management
- `GET /api/academics/subjects` - Get subjects
- `GET /api/academics/classes` - Get classes
- `GET /api/academics/timetable` - Get timetables
- `POST /api/academics/grades` - Submit grades

### Financial Management
- `GET /api/finance/fees` - Get fee structure
- `GET /api/finance/payments` - Get payments
- `POST /api/finance/payments` - Record payment
- `GET /api/finance/student/:id/statement` - Get fee statement

### Attendance Management
- `GET /api/attendance/today` - Get today's attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/student/:id` - Get student attendance

## Deployment

### Railway Deployment

1. **Connect to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   ```

2. **Set Environment Variables**
   ```bash
   railway variables set MONGODB_URI=your-mongodb-connection-string
   railway variables set JWT_SECRET=your-jwt-secret
   railway variables set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the production server**
   ```bash
   npm start
   ```

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run setup-db` - Initialize database with default data
- `npm run seed` - Seed database with sample data

### Adding New Features

1. **Create Models** - Add new MongoDB schemas in `models/`
2. **Create Routes** - Add API endpoints in `routes/`
3. **Add Middleware** - Create custom middleware in `middleware/`
4. **Update Frontend** - Add UI components in `public/`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- Session management

## Performance Features

- Database indexing for fast queries
- Response compression
- Static file caching
- Efficient pagination
- Real-time updates with Socket.IO

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### Version 1.0.0
- Initial release
- Complete school management system
- User authentication and authorization
- Student and teacher management
- Academic and financial modules
- Real-time messaging and notifications

---

**Glotech High School Management System** - Empowering education through technology.