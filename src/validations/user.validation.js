import Joi from "joi";
import { EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX, ROLE_VALUES, USER_STATUS_VALUES } from "../utils/constants.js";

const id = Joi.string().regex(/^[a-fA-F0-9]{24}$/).message("Invalid Mongo ObjectId");
const nameNoDigits = /^[^\d]+$/; 
const firstName = Joi.string().min(2).max(100).trim().pattern(nameNoDigits).message("First name must not contain digits");
const lastName = Joi.string().min(2).max(100).trim().pattern(nameNoDigits).message("Last name must not contain digits");
const email = Joi.string().trim().lowercase().pattern(EMAIL_REGEX).email();
const phone = Joi.string().trim().pattern(PHONE_REGEX).optional();
const role = Joi.string().valid(...ROLE_VALUES);
const status = Joi.string().valid(...USER_STATUS_VALUES);

const password = Joi.string()
  .pattern(PASSWORD_REGEX)
  .message("Password must be at least 8 characters and include upper, lower, number and special character");

export const createUserSchema = Joi.object({
  firstName: firstName.required(),
  lastName: lastName.required(),
  email: email.required(),
  phone,
  role: role.optional(),
  status: status.optional(),
  password: password.required(),
});

export const updateUserSchema = Joi.object({
  firstName,
  lastName,
  email,
  phone,
  role,
  status,
  password,
}).min(1);

export const getUserByIdSchema = Joi.object({
  id: id.required(),
});

export const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: role.optional(),
  status: status.optional(),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string().valid("createdAt", "updatedAt", "firstName", "lastName", "email").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: password.required(),
});


