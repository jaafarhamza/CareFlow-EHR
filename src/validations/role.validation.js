import Joi from "joi";
import { PERMISSIONS } from "../utils/constants.js";

const objectId = Joi.string().regex(/^[a-fA-F0-9]{24}$/).message("Invalid Mongo ObjectId");
const permissionValues = Object.values(PERMISSIONS);

export const createRoleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  permissions: Joi.array().items(Joi.string().valid(...permissionValues)).default([]),
  description: Joi.string().trim().allow(null).optional(),
}).unknown(false);

export const updateRoleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  permissions: Joi.array().items(Joi.string().valid(...permissionValues)),
  description: Joi.string().trim().allow(null),
}).min(1).unknown(false);

export const getRoleByIdSchema = Joi.object({
  id: objectId.required(),
});

export const listRolesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional(),
  name: Joi.string().trim().optional(),
  sortBy: Joi.string().valid("createdAt", "updatedAt", "name").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
}).unknown(false);
