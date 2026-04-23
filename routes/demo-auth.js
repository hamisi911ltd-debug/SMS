const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, demoLogin, demoUsers } = require('../middleware/demo-auth');
const router = express.Router();

// @route   POST /api/auth/login
// @desc    Demo login
// @access  Public
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;
    const result = demoLogin(username, password);

    if (result.success) {
      // Store token in session
      req.session.token = result.token;
      req.session.userId = result.user._id;
      req.session.userRole = result.user.role;

      res.json({
        success: true,
        message: 'Login successful (Demo Mode)',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Demo logout
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Clear session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Demo logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user (demo)
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: { user: req.user }
    });

  } catch (error) {
    console.error('Get demo user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (demo)
// @access  Private (Admin)
router.get('/users', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const users = Object.values(demoUsers);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: 1,
          pages: 1,
          total: users.length
        }
      }
    });

  } catch (error) {
    console.error('Get demo users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;