// Demo authentication middleware for when MongoDB is not available

const demoUsers = {
  admin: {
    _id: 'demo-admin-id',
    username: 'admin',
    email: 'admin@glotechhigh.ac.ke',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    fullName: 'System Administrator',
    isActive: true
  },
  'john.teacher': {
    _id: 'demo-teacher-id',
    username: 'john.teacher',
    email: 'john.teacher@glotechhigh.ac.ke',
    firstName: 'John',
    lastName: 'Kamau',
    role: 'teacher',
    fullName: 'John Kamau',
    isActive: true
  },
  'jane.student': {
    _id: 'demo-student-id',
    username: 'jane.student',
    email: 'jane.student@glotechhigh.ac.ke',
    firstName: 'Jane',
    lastName: 'Wanjiku',
    role: 'student',
    fullName: 'Jane Wanjiku',
    isActive: true
  }
};

const demoPasswords = {
  admin: 'admin123',
  'john.teacher': 'teacher123',
  'jane.student': 'student123'
};

const demoAuth = async (req, res, next) => {
  try {
    // Get token from header or session
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.session?.token ||
                  req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // In demo mode, token is just the username
    const user = demoUsers[token];
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    // Add user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Demo auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Role-based authorization middleware
const demoAuthorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Demo login function
const demoLogin = (username, password) => {
  console.log(`Demo login attempt: username="${username}", password="${password}"`);
  console.log('Available users:', Object.keys(demoUsers));
  console.log('Available passwords:', Object.keys(demoPasswords));
  
  const user = demoUsers[username];
  const correctPassword = demoPasswords[username];
  
  console.log(`User found: ${!!user}, Password match: ${password === correctPassword}`);
  
  if (user && password === correctPassword) {
    console.log('Demo login successful for:', username);
    return {
      success: true,
      user,
      token: username // In demo mode, token is just the username
    };
  }
  
  console.log('Demo login failed for:', username);
  return {
    success: false,
    message: 'Invalid login credentials'
  };
};

module.exports = { 
  auth: demoAuth, 
  authorize: demoAuthorize, 
  demoLogin,
  demoUsers 
};