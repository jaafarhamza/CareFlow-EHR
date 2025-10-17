import User from "../models/user.model.js";

export default {
  async create({ firstName, lastName, email, passwordHash }) {
    const user = await User.create({ firstName, lastName, email, passwordHash });
    return user;
  },
  async findByEmailWithPassword(email) {
    return User.findOne({ email }).select("+passwordHash");
  },
  async findById(id) {
    return User.findById(id);
  },
  async findOne(filter) {
    return User.findOne(filter);
  },
  async updateById(id, update) {
    return User.findByIdAndUpdate(id, update, { new: true });
  },
  async deleteById(id) {
    return User.findByIdAndDelete(id);
  },
  async list({ page = 1, limit = 10, filter = {}, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },
  buildFilter({ role, status, search }) {
    const filter = {};
    if (!status) {
      filter.status = { $ne: "deleted" };
    }
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
        { role: regex },
      ];
    }
    return filter;
  },
};

