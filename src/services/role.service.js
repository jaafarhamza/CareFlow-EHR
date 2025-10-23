import roleRepo from '../repositories/role.repository.js';
import User from '../models/user.model.js';
import { ROLES } from '../utils/constants.js';

const SYSTEM_ROLES = new Set(Object.values(ROLES));

class RoleError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function createRole(input) {
  const { name, permissions = [], description = null } = input;

  if (SYSTEM_ROLES.has(name.toLowerCase())) {
    throw new RoleError('Cannot create role with system role name', 400);
  }

  try {
    const created = await roleRepo.create({
      name: name.trim(),
      permissions: [...new Set(permissions)],
      description,
      isSystem: false
    });
    return created;
  } catch (error) {
    if (error.code === 11000) {
      throw new RoleError('Role name already exists', 409);
    }
    throw error;
  }
}

export async function listRoles(params) {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = params;
  const filter = roleRepo.buildFilter(filters);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  return roleRepo.list({ page, limit, filter, sort });
}

export async function getRoleById(id) {
  const role = await roleRepo.findById(id);
  if (!role) throw new RoleError('Role not found', 404);
  return role;
}

export async function updateRole(id, input) {
  const existing = await roleRepo.findById(id);
  if (!existing) throw new RoleError('Role not found', 404);

  if (existing.isSystem) {
    throw new RoleError('System roles cannot be modified', 403);
  }

  const update = {};

  if (input.name !== undefined) {
    const newName = input.name.trim();
    if (newName !== existing.name) {
      if (SYSTEM_ROLES.has(newName.toLowerCase())) {
        throw new RoleError('Cannot rename to system role name', 400);
      }
      update.name = newName;
    }
  }

  if (input.permissions !== undefined) {
    update.permissions = [...new Set(input.permissions)];
  }

  if (input.description !== undefined) {
    update.description = input.description;
  }

  if (Object.keys(update).length === 0) {
    throw new RoleError('No valid fields to update', 400);
  }

  try {
    const updated = await roleRepo.updateById(id, update);
    return updated;
  } catch (error) {
    if (error.code === 11000) {
      throw new RoleError('Role name already exists', 409);
    }
    throw error;
  }
}

export async function deleteRole(id) {
  const existing = await roleRepo.findById(id);
  if (!existing) throw new RoleError('Role not found', 404);

  if (existing.isSystem) {
    throw new RoleError('System roles cannot be deleted', 403);
  }

  const usersCount = await User.countDocuments({ role: existing.name });
  if (usersCount > 0) {
    throw new RoleError(`Cannot delete role assigned to ${usersCount} user(s)`, 409);
  }

  return roleRepo.deleteById(id);
}
