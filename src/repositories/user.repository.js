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
};

