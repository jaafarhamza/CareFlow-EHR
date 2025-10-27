import Patient from '../models/patient.model.js';

export default {
  async create(data) {
    return Patient.create(data);
  },

  async findById(id) {
    return Patient.findById(id).populate('userId', 'firstName lastName email phone');
  },

  async findByUserId(userId) {
    return Patient.findOne({ userId }).populate('userId', 'firstName lastName email phone');
  },

  async updateById(id, update) {
    return Patient.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate('userId', 'firstName lastName email phone');
  },

  async deleteById(id) {
    return Patient.findByIdAndDelete(id);
  },

  async list({ page = 1, limit = 10, filter = {}, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Patient.find(filter)
        .populate('userId', 'firstName lastName email phone')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(filter)
    ]);
    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    };
  },

  buildFilter({ search, bloodType, gender }) {
    const filter = {};

    if (bloodType) filter.bloodType = bloodType;
    if (gender) filter.gender = gender;

    if (search) {
      const searchTerm = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { 'address.city': { $regex: searchTerm, $options: 'i' } },
        { allergies: { $regex: searchTerm, $options: 'i' } },
        { chronicConditions: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    return filter;
  }
};
