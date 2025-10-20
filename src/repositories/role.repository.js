import Role from "../models/role.model.js";

const cache = new Map();
const TTL_MS = 60_000; // 60s cache

function getCached(name) {
  const entry = cache.get(name);
  if (!entry) return null;
  if (entry.exp < Date.now()) {
    cache.delete(name);
    return null;
  }
  return entry.perms;
}

function setCached(name, perms) {
  cache.set(name, { perms, exp: Date.now() + TTL_MS });
}

function invalidate(name) {
  if (name) cache.delete(name);
}

export default {
  async getPermissionsByName(name) {
    if (!name) return [];
    const cached = getCached(name);
    if (cached) return cached;
    const doc = await Role.findOne({ name }).lean();
    const perms = Array.isArray(doc?.permissions) ? doc.permissions : [];
    setCached(name, perms);
    return perms;
  },
  async upsertMany(roles) {
    for (const r of roles) {
      await Role.updateOne(
        { name: r.name },
        {
          $set: {
            permissions: Array.isArray(r.permissions) ? r.permissions : [],
            description: r.description ?? null,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
      invalidate(r.name);
    }
  },
  async create(doc) {
    const created = await Role.create(doc);
    invalidate(created.name);
    return created;
  },
  async findById(id) {
    return Role.findById(id);
  },
  async findOne(filter) {
    return Role.findOne(filter);
  },
  async updateById(id, update) {
    const updated = await Role.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (updated?.name) invalidate(updated.name);
    return updated;
  },
  async deleteById(id) {
    const deleted = await Role.findByIdAndDelete(id);
    if (deleted?.name) invalidate(deleted.name);
    return deleted;
  },
  async list({ page = 1, limit = 10, filter = {}, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Role.find(filter).sort(sort).skip(skip).limit(limit),
      Role.countDocuments(filter),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },
  buildFilter({ search, name }) {
    const filter = {};
    if (name) filter.name = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { description: regex }];
    }
    return filter;
  },
};
