import userRepo from "../repositories/user.repository.js";
import User from "../models/user.model.js";
import { USER_STATUSES } from "../utils/constants.js";
import tokenRepo from "../repositories/refreshToken.repository.js";

export async function adminCreateUser(input) {
  const { firstName, lastName, email, phone = undefined, role, status, password } = input;
  const exists = await userRepo.findOne({ email });
  if (exists) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }
  const passwordHash = await User.hashPassword(password);
  const user = await userRepo.create({ firstName, lastName, email, passwordHash });
  if (phone || role || status) {
    user.phone = phone ?? user.phone;
    if (role) user.role = role;
    if (status) user.status = status;
    await user.save();
  }
  return user.toSafeObject();
}

export async function adminListUsers(params) {
  const { page = 1, limit = 10, role, status, search, sortBy = "createdAt", sortOrder = "desc" } = params;
  const filter = userRepo.buildFilter({ role, status, search });
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const result = await userRepo.list({ page, limit, filter, sort });
  return {
    ...result,
    items: result.items.map((u) => u.toSafeObject()),
  };
}

export async function adminGetUserProfile(id) {
  const user = await userRepo.findById(id);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user.toSafeObject();
}

export async function adminUpdateUser(id, input) {
  const update = { ...input };
  if (update.password) {
    update.passwordHash = await User.hashPassword(update.password);
    delete update.password;
  }
  const updated = await userRepo.updateById(id, update);
  if (!updated) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return updated.toSafeObject();
}

export async function adminSuspendUser(id) {
  const updated = await userRepo.updateById(id, { status: USER_STATUSES.SUSPENDED, isActive: false });
  if (!updated) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  await tokenRepo.revokeAllByUserId(updated.id);
  return updated.toSafeObject();
}

export async function adminReactivateUser(id) {
  const updated = await userRepo.updateById(id, { status: USER_STATUSES.ACTIVE, isActive: true });
  if (!updated) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return updated.toSafeObject();
}

export async function adminDeleteUser(id, actingUserId) {
  if (actingUserId && String(actingUserId) === String(id)) {
    const err = new Error("Admins cannot delete their own account");
    err.status = 400;
    throw err;
  }
  const existing = await userRepo.findById(id);
  if (!existing) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  await tokenRepo.revokeAllByUserId(existing.id);
  const deleted = await userRepo.deleteById(id);
  return deleted ? deleted.toSafeObject() : null;
}


