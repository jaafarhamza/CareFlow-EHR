import Doctor from '../models/doctor.model.js';

class DoctorRepository {
  async create(data) {
    return await Doctor.create(data);
  }

  async findById(id) {
    return await Doctor.findById(id).populate('userId', 'firstName lastName email phone');
  }

  async findByUserId(userId) {
    return await Doctor.findOne({ userId }).populate('userId', 'firstName lastName email phone');
  }

  async findByLicenseNumber(licenseNumber) {
    return await Doctor.findOne({ licenseNumber });
  }

  async list({ page, limit, filter, sort }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Doctor.find(filter)
        .populate('userId', 'firstName lastName email phone')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Doctor.countDocuments(filter)
    ]);
    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    };
  }

  async updateById(id, update) {
    return await Doctor.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate('userId', 'firstName lastName email phone');
  }

  async deleteById(id) {
    return await Doctor.findByIdAndDelete(id);
  }

  buildFilter({ specialization, isAvailable, search }) {
    const filter = {};
    if (specialization) filter.specialization = specialization;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (search) {
      filter.$or = [
        { specialization: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }
    return filter;
  }
}

export default new DoctorRepository();
