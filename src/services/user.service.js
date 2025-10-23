import userRepo from '../repositories/user.repository.js';
import User from '../models/user.model.js';
import { USER_STATUSES } from '../utils/constants.js';
import tokenRepo from '../repositories/refreshToken.repository.js';

const ALLOWED_UPDATE_FIELDS = ['firstName', 'lastName', 'phone', 'role', 'status'];

class UserError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function adminCreateUser(input) {
  const { firstName, lastName, email, phone, role, status, password } = input;

  const passwordHash = await User.hashPassword(password);
  
  try {
    const user = await userRepo.create({
      firstName,
      lastName,
      email,
      phone,
      role,
      status,
      passwordHash
    });
    return user.toSafeObject();
  } catch (error) {
    if (error.code === 11000) {
      throw new UserError('Email already in use', 409);
    }
    throw error;
  }
}

export async function adminListUsers(params) {
  const { page = 1, limit = 10, role, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
  
  const filter = userRepo.buildFilter({ role, status, search });
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  
  const result = await userRepo.list({ page, limit, filter, sort });
  
  return {
    ...result,
    items: result.items.map(u => u.toSafeObject())
  };
}

export async function adminGetUserProfile(id) {
  const user = await userRepo.findById(id);
  if (!user) throw new UserError('User not found', 404);
  return user.toSafeObject();
}

export async function adminUpdateUser(id, input) {
  const update = {};
  
  ALLOWED_UPDATE_FIELDS.forEach(field => {
    if (input[field] !== undefined) {
      update[field] = input[field];
    }
  });

  if (input.password) {
    update.passwordHash = await User.hashPassword(input.password);
  }

  if (Object.keys(update).length === 0) {
    throw new UserError('No valid fields to update', 400);
  }

  const updated = await userRepo.updateById(id, update);
  if (!updated) throw new UserError('User not found', 404);
  
  return updated.toSafeObject();
}

export async function adminSuspendUser(id) {
  const updated = await userRepo.updateById(id, {
    status: USER_STATUSES.SUSPENDED,
    isActive: false
  });
  
  if (!updated) throw new UserError('User not found', 404);
  
  await tokenRepo.revokeAllByUserId(id);
  
  return updated.toSafeObject();
}

export async function adminReactivateUser(id) {
  const user = await userRepo.findById(id);
  if (!user) throw new UserError('User not found', 404);
  
  if (user.status === USER_STATUSES.DELETED) {
    throw new UserError('Cannot reactivate deleted user', 400);
  }

  const updated = await userRepo.updateById(id, {
    status: USER_STATUSES.ACTIVE,
    isActive: true
  });
  
  return updated.toSafeObject();
}

export async function adminDeleteUser(id, actingUserId) {
  if (actingUserId && String(actingUserId) === String(id)) {
    throw new UserError('Cannot delete your own account', 400);
  }

  const user = await userRepo.findById(id);
  if (!user) throw new UserError('User not found', 404);

  const updated = await userRepo.updateById(id, {
    status: USER_STATUSES.DELETED,
    isActive: false,
    email: `deleted_${Date.now()}_${user.email}`
  });

  await tokenRepo.revokeAllByUserId(id);
  
  return updated.toSafeObject();
}
