const Setting = require('../models/Setting');
const CustomPurposeCategory = require('../models/CustomPurposeCategory');
const { createAuditLog } = require('../middleware/auditLogger');

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find().sort({ key: 1 });
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

exports.updateSetting = async (req, res, next) => {
  try {
    const { key, value, description } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value, description, updatedBy: req.user._id },
      { new: true, upsert: true }
    );
    await createAuditLog({ action: 'setting_updated', entity: 'Setting', entityId: setting._id, newData: { key, value }, performedBy: req.user._id, req });
    res.json({ setting });
  } catch (error) {
    next(error);
  }
};

exports.getCustomPurposeCategories = async (req, res, next) => {
  try {
    const categories = await CustomPurposeCategory.find()
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

exports.approveCustomPurpose = async (req, res, next) => {
  try {
    const category = await CustomPurposeCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    category.isApproved = true;
    category.approvedBy = req.user._id;
    category.approvedAt = new Date();
    await category.save();
    await createAuditLog({ action: 'custom_purpose_approved', entity: 'CustomPurposeCategory', entityId: category._id, newData: { title: category.title }, performedBy: req.user._id, req });
    res.json({ category });
  } catch (error) {
    next(error);
  }
};
