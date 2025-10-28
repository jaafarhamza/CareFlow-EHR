export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  PATIENT: "patient",
  NURSE: "nurse",
  SECRETARY: "secretary",
};

export const ROLE_VALUES = Object.values(ROLES);

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const USER_STATUSES = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DELETED: "deleted",
};

export const USER_STATUS_VALUES = Object.values(USER_STATUSES);

// general permissions
export const AUTH_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME_MS: 15 * 60 * 1000,
  RESET_CODE_LENGTH: 6,
  RESET_SESSION_TTL: 15 * 60
};

export const SALT_ROUNDS = 10;

export const AUDIT_ACTIONS = {
  LOGIN_SUCCESS: 'login:success',
  LOGIN_FAILED: 'login:failed',
  LOGOUT: 'logout',
  PASSWORD_RESET_REQUEST: 'password:reset:request',
  PASSWORD_RESET_COMPLETE: 'password:reset:complete',
  TOKEN_REFRESH: 'token:refresh',
  ACCOUNT_LOCKED: 'account:locked'
};

export const PERMISSIONS = {
  ROLE_MANAGE: "role:manage",
  USER_MANAGE: "user:manage",

  PATIENT_READ_ANY: "patient:read:any",
  PATIENT_WRITE_ANY: "patient:write:any",
  PATIENT_READ_SELF: "patient:read:self",
  PATIENT_WRITE_SELF: "patient:write:self",

  DOCTOR_READ_ANY: "doctor:read:any",
  DOCTOR_WRITE_ANY: "doctor:write:any",
  DOCTOR_READ_SELF: "doctor:read:self",
  DOCTOR_WRITE_SELF: "doctor:write:self",

  APPT_READ_ANY: "appt:read:any",
  APPT_WRITE_ANY: "appt:write:any",
  APPT_READ_SELF: "appt:read:self",
  APPT_WRITE_SELF: "appt:write:self",
  APPT_STATUS_COMPLETE: "appt:status:complete",
  APPT_STATUS_CANCEL: "appt:status:cancel",

  AVAILABILITY_READ_ANY: "availability:read:any",
};


