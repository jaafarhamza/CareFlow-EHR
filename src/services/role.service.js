import roleRepo from "../repositories/role.repository.js";
import userRepo from "../repositories/user.repository.js";
import { ROLES } from "../utils/constants.js";

const PROTECTED_ROLES = new Set(Object.values(ROLES));

export async function createRole(input) {
  const { name, permissions = [], description = null } = input;
  try {
    const created = await roleRepo.create({ name, permissions, description });
    return created;
  } catch (e) {
    if (e?.code === 11000) {
      const err = new Error("Role name already exists");
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

export async function listRoles(params) {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", ...filters } = params;
  const filter = roleRepo.buildFilter(filters);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  return roleRepo.list({ page, limit, filter, sort });
}

export async function getRoleById(id) {
  const role = await roleRepo.findById(id);
  if (!role) {
    const err = new Error("Role not found");
    err.status = 404;
    throw err;
  }
  return role;
}

export async function updateRole(id, input) {
  const existing = await roleRepo.findById(id);
  if (!existing) {
    const err = new Error("Role not found");
    err.status = 404;
    throw err;
  }

  // Prevent renaming protected roles (name change)
  if (typeof input.name === "string" && input.name.trim() && input.name.trim() !== existing.name) {
    if (PROTECTED_ROLES.has(existing.name) || PROTECTED_ROLES.has(input.name.trim())) {
      const err = new Error("Protected roles cannot be renamed");
      err.status = 400;
      throw err;
    }
  }

  try {
    const updated = await roleRepo.updateById(id, input);
    return updated;
  } catch (e) {
    if (e?.code === 11000) {
      const err = new Error("Role name already exists");
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

export async function deleteRole(id) {
  const existing = await roleRepo.findById(id);
  if (!existing) {
    const err = new Error("Role not found");
    err.status = 404;
    throw err;
  }
  if (PROTECTED_ROLES.has(existing.name)) {
    const err = new Error("Protected roles cannot be deleted");
    err.status = 400;
    throw err;
  }

  // Prevent deleting roles in use
  const { total } = await userRepo.list({ filter: { role: existing.name }, page: 1, limit: 1 });
  if (total > 0) {
    const err = new Error("Cannot delete role that is assigned to users");
    err.status = 409;
    throw err;
  }

  const deleted = await roleRepo.deleteById(id);
  return deleted;
}
