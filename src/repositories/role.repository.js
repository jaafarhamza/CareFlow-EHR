import Role from '../models/role.model.js';

class RoleCache {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl;
    this.maxSize = 100;
  }

  get(name) {
    const entry = this.cache.get(name);
    if (!entry || entry.exp < Date.now()) {
      this.cache.delete(name);
      return null;
    }
    return entry.perms;
  }

  set(name, perms) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(name, { perms, exp: Date.now() + this.ttl });
  }

  invalidate(name) {
    if (name) this.cache.delete(name);
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new RoleCache();

export default {
  async getPermissionsByName(name) {
    if (!name) return [];
    
    const cached = cache.get(name);
    if (cached) return cached;
    
    const doc = await Role.findOne({ name }).lean();
    const perms = doc?.permissions || [];
    
    cache.set(name, perms);
    return perms;
  },

  async upsertMany(roles) {
    const operations = roles.map(r => ({
      updateOne: {
        filter: { name: r.name },
        update: {
          $set: {
            permissions: r.permissions || [],
            description: r.description || null,
            isSystem: r.isSystem || false,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));

    await Role.bulkWrite(operations);
    cache.clear();
  },

  async create(doc) {
    const created = await Role.create(doc);
    cache.invalidate(created.name);
    return created;
  },

  async findById(id) {
    return Role.findById(id);
  },

  async findOne(filter) {
    return Role.findOne(filter);
  },

  async updateById(id, update) {
    const old = await Role.findById(id).lean();
    const updated = await Role.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    
    if (old?.name) cache.invalidate(old.name);
    if (updated?.name && updated.name !== old?.name) {
      cache.invalidate(updated.name);
    }
    
    return updated;
  },

  async deleteById(id) {
    const deleted = await Role.findByIdAndDelete(id);
    if (deleted?.name) cache.invalidate(deleted.name);
    return deleted;
  },

  async list({ page = 1, limit = 10, filter = {}, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Role.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Role.countDocuments(filter)
    ]);
    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    };
  },

  buildFilter({ search, name }) {
    const filter = {};
    
    if (name) {
      filter.name = { $regex: name.trim(), $options: 'i' };
    }
    
    if (search) {
      const searchTerm = search.trim();
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    return filter;
  }
};
