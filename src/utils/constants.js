export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  PATIENT: "patient",
  NURSE: "nurse",
  SECRETARY: "secretary",
  PHARMACIST: "pharmacist",
  LAB_TECHNICIAN: "lab_technician",
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

  // Consultation permissions
  CONSULTATION_READ_ANY: "consultation:read:any",
  CONSULTATION_WRITE_ANY: "consultation:write:any",
  CONSULTATION_READ_SELF: "consultation:read:self",

  // Prescription permissions
  PRESCRIPTION_READ_ANY: "prescription:read:any",
  PRESCRIPTION_WRITE_ANY: "prescription:write:any",
  PRESCRIPTION_READ_SELF: "prescription:read:self",
  PRESCRIPTION_SIGN: "prescription:sign",
  PRESCRIPTION_DISPENSE: "prescription:dispense",

  // Pharmacy permissions
  PHARMACY_READ_ANY: "pharmacy:read:any",
  PHARMACY_WRITE_ANY: "pharmacy:write:any",
  PHARMACY_MANAGE: "pharmacy:manage",
  PHARMACY_PRESCRIPTIONS: "pharmacy:prescriptions",

  // Laboratory permissions
  LAB_ORDER_READ_ANY: "lab:order:read:any",
  LAB_ORDER_WRITE_ANY: "lab:order:write:any",
  LAB_ORDER_READ_SELF: "lab:order:read:self",
  LAB_RESULT_READ_ANY: "lab:result:read:any",
  LAB_RESULT_WRITE_ANY: "lab:result:write:any",
  LAB_RESULT_READ_SELF: "lab:result:read:self",
  LAB_RESULT_VALIDATE: "lab:result:validate",

  // Document permissions
  DOCUMENT_READ_ANY: "document:read:any",
  DOCUMENT_WRITE_ANY: "document:write:any",
  DOCUMENT_READ_SELF: "document:read:self",
  DOCUMENT_WRITE_SELF: "document:write:self",
  DOCUMENT_DELETE: "document:delete",
  DOCUMENT_VERIFY: "document:verify",
};


