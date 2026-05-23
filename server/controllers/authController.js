const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
    const user = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }],
    }).populate('role').populate('department');

    if (!user) {
      await LoginLog.create({ user: null, action: 'failed_login', success: false, reason: 'User not found', ipAddress: req.ip, userAgent: req.get('user-agent') }).catch(() => {});
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      await LoginLog.create({ user: user._id, action: 'failed_login', success: false, reason: 'Account disabled', ipAddress: req.ip, userAgent: req.get('user-agent') });
      return res.status(401).json({ message: 'Account is disabled. Contact admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await LoginLog.create({ user: user._id, action: 'failed_login', success: false, reason: 'Wrong password', ipAddress: req.ip, userAgent: req.get('user-agent') });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    await LoginLog.create({ user: user._id, action: 'login', success: true, ipAddress: req.ip, userAgent: req.get('user-agent') });

    res.json({
      accessToken,
      refreshToken,
      user: user.toJSON(),
      mustChangePassword: user.mustChangePassword,
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, _next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId).populate('role').populate('department');

    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    await LoginLog.create({ user: user._id, action: 'token_refresh', success: true, ipAddress: req.ip, userAgent: req.get('user-agent') });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user.toJSON() });
};

exports.logout = async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    await LoginLog.create({ user: req.user._id, action: 'logout', success: true, ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
