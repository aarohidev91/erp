const Course = require('../models/Course');
const { createAuditLog } = require('../middleware/auditLogger');

exports.getCourses = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.department) filter.department = req.query.department;
    const courses = await Course.find(filter).populate('department', 'name code').sort({ name: 1 });
    res.json({ courses });
  } catch (error) {
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const course = await Course.create({ ...req.body, createdBy: req.user._id });
    await createAuditLog({ action: 'course_created', entity: 'Course', entityId: course._id, newData: req.body, performedBy: req.user._id, req });
    const populated = await Course.findById(course._id).populate('department', 'name code');
    res.status(201).json({ course: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('department', 'name code');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await createAuditLog({ action: 'course_updated', entity: 'Course', entityId: course._id, newData: req.body, performedBy: req.user._id, req });
    res.json({ course });
  } catch (error) {
    next(error);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('department', 'name code');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (error) {
    next(error);
  }
};
