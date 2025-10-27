import User from '../models/user.model.js';

export default {
  async create(data) {
    return User.create(data);
  },

  async findByEmailWithPassword(email) {
    return User.findOne({ email }).select('+passwordHash');
  },

  async findById(id) {
    return User.findById(id);
  },

  async findOne(filter) {
    return User.findOne(filter);
  },

  async updateById(id, update) {
    return User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  },

  async list({ page = 1, limit = 10, filter = {}, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(filter)
    ]);
    return {
      items: items.map(item => new User(item)),
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    };
  },

  buildFilter({ role, status, search }) {
    const filter = {};

    if (!status) {
      filter.status = { $ne: 'deleted' };
    } else if (typeof status === 'string') {
      filter.status = status;
    }

    if (role && typeof role === 'string') filter.role = role;

    if (search && typeof search === 'string') {
      const searchTerm = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ];
      
      if (/^\+?\d+$/.test(searchTerm)) {
        filter.$or.push({ phone: { $regex: searchTerm } });
      }
    }

    return filter;
  }
};
