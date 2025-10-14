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


