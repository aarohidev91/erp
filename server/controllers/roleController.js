const Role = require('../models/Role');
const { createAuditLog } = require('../middleware/auditLogger');

exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find({ isActive: true }).sort({ name: 1 });
    res.json({ roles });
  } catch (error) {
    next(error);
  }
};

exports.createRole = async (req, res, next) => {
  try {
    const { name, slug, description, permissions } = req.body;
    const role = await Role.create({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '_'), description, permissions, createdBy: req.user._id });
    await createAuditLog({ action: 'role_created', entity: 'Role', entityId: role._id, newData: { name, permissions }, performedBy: req.user._id, req });
    res.status(201).json({ role });
  } catch (error) {
    next(error);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    if (role.isSystem) return res.status(400).json({ message: 'Cannot modify system role' });
    const prev = { name: role.name, permissions: role.permissions };
    Object.assign(role, req.body);
    await role.save();
    await createAuditLog({ action: 'role_updated', entity: 'Role', entityId: role._id, previousData: prev, newData: req.body, performedBy: req.user._id, req });
    res.json({ role });
  } catch (error) {
    next(error);
  }
};

exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    if (role.isSystem) return res.status(400).json({ message: 'Cannot delete system role' });
    role.isActive = false;
    await role.save();
    await createAuditLog({ action: 'role_deleted', entity: 'Role', entityId: role._id, performedBy: req.user._id, req });
    res.json({ message: 'Role deactivated' });
  } catch (error) {
    next(error);
  }
};

exports.getRoleById = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json({ role });
  } catch (error) {
    next(error);
  }
};
