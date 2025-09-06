const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    console.log(`🔐 AdminAuth middleware - ${req.method} ${req.path}`);
    console.log('Authorization header:', req.header('Authorization'));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    console.log('Token found, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully, user ID:', decoded.id);
    
    // Check if user exists and has admin role
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('User found:', user.email, 'Role:', user.role);
    
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      console.log('❌ Insufficient role:', user.role);
      return res.status(403).json({ error: 'Access denied. Admin or Super Admin role required.' });
    }

    console.log('✅ AdminAuth successful for user:', user.email);
    req.user = user;
    next();
  } catch (err) {
    console.log('❌ AdminAuth error:', err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
}; 