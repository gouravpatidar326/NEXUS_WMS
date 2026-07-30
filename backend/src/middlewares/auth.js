const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, companyId, ... }
    
    // Super Admins should have global visibility
    if (req.user.role === 'SUPER_ADMIN') {
      req.user.companyId = null;
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    const userRole = (req.user?.role || '').toUpperCase();
    const allowedRoles = roles.map(r => r.toUpperCase());
    if (!req.user || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};


