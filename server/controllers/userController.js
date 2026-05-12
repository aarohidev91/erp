const User = require('../models/User');
const { createAuditLog } = require('../middleware/auditLogger');
const crypto = require('crypto');

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, department, isActive, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(filter)
      .populate('role', 'name slug')
      .populate('department', 'name code')
      .populate('createdBy', 'firstName lastName')
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { username, email, firstName, lastName, role, department, phone } = req.body;
    const tempPassword = req.body.password || crypto.randomBytes(6).toString('hex');
    const user = await User.create({
      username, email, firstName, lastName, role, department, phone,
      password: tempPassword, mustChangePassword: true, createdBy: req.user._id,
    });
    await createAuditLog({ action: 'user_created', entity: 'User', entityId: user._id, newData: { username, email, role }, performedBy: req.user._id, req });
    const populated = await User.findById(user._id).populate('role', 'name slug').populate('department', 'name code');
    res.status(201).json({ user: populated.toJSON(), temporaryPassword: tempPassword });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, role, department, phone, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const prev = { firstName: user.firstName, role: user.role, department: user.department, isActive: user.isActive };
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (role !== undefined) user.role = role;
    if (department !== undefined) user.department = department;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();
    await createAuditLog({ action: 'user_updated', entity: 'User', entityId: user._id, previousData: prev, newData: req.body, performedBy: req.user._id, req });
    const populated = await User.findById(user._id).populate('role', 'name slug').populate('department', 'name code');
    res.json({ user: populated.toJSON() });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const tempPassword = req.body.newPassword || crypto.randomBytes(6).toString('hex');
    user.password = tempPassword;
    user.mustChangePassword = true;
    await user.save();
    await createAuditLog({ action: 'password_reset', entity: 'User', entityId: user._id, performedBy: req.user._id, req });
    res.json({ message: 'Password reset successfully', temporaryPassword: tempPassword });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('role', 'name slug permissions').populate('department', 'name code').select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
