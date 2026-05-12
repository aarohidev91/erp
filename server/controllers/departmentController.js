const Department = require('../models/Department');
const { createAuditLog } = require('../middleware/auditLogger');

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).populate('hod', 'firstName lastName').sort({ name: 1 });
    res.json({ departments });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create({ ...req.body, createdBy: req.user._id });
    await createAuditLog({ action: 'department_created', entity: 'Department', entityId: department._id, newData: req.body, performedBy: req.user._id, req });
    res.status(201).json({ department });
  } catch (error) {
    next(error);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) return res.status(404).json({ message: 'Department not found' });
    await createAuditLog({ action: 'department_updated', entity: 'Department', entityId: department._id, newData: req.body, performedBy: req.user._id, req });
    res.json({ department });
  } catch (error) {
    next(error);
  }
};

exports.getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('hod', 'firstName lastName');
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json({ department });
  } catch (error) {
    next(error);
  }
};
