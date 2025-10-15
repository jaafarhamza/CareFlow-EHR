import Joi from "joi";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../utils/constants.js";

export const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().pattern(EMAIL_REGEX).lowercase().required(),
  password: Joi.string().pattern(PASSWORD_REGEX).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().pattern(EMAIL_REGEX).lowercase().required(),
  password: Joi.string().required(),
});

export const requestResetSchema = Joi.object({
  email: Joi.string().pattern(EMAIL_REGEX).lowercase().required(),
});

export const verifyResetSchema = Joi.object({
  email: Joi.string().pattern(EMAIL_REGEX).lowercase().required(),
  code: Joi.string().length(6).regex(/^\d{6}$/).required(),
});

export const applyResetSchema = Joi.object({
  email: Joi.string().pattern(EMAIL_REGEX).lowercase().required(),
  code: Joi.string().length(6).regex(/^\d{6}$/).required(),
  newPassword: Joi.string().pattern(PASSWORD_REGEX).required(),
});


