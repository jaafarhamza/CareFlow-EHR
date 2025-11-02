# Role Management API Documentation

## Overview
Manage user roles and permissions for role-based access control (RBAC).

---

## Base URL
```
http://localhost:5000/api/admin/roles
```

---

## Endpoints

### 1. List All Roles
**GET** `/api/admin/roles`

**Permission:** `ROLE_MANAGE` (Admin only)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "6903b693610a2dd1e89735a0",
      "name": "doctor",
      "permissions": [
        "patient:read:any",
        "patient:write:any",
        "appt:read:any",
        "appt:write:any",
        "consultation:read:any",
        "consultation:write:any",
        "prescription:read:any",
        "prescription:write:any",
        "prescription:sign",
        "lab:order:read:any",
        "lab:order:write:any",
        "lab:result:read:any",
        "document:read:any",
        "document:write:any",
        "document:verify"
      ],
      "description": "Medical doctor with full patient care access",
      "createdAt": "2025-11-01T10:00:00Z"
    }
  ]
}
```

### 2. Create Role
**POST** `/api/admin/roles`

**Permission:** `ROLE_MANAGE`

**Request Body:**
```json
{
  "name": "radiologist",
  "permissions": [
    "patient:read:any",
    "appt:read:any",
    "document:read:any",
    "document:write:any",
    "document:verify"
  ],
  "description": "Radiologist with imaging access"
}
```

**Response:** `201 Created`

### 3. Get Role by ID
**GET** `/api/admin/roles/:id`

### 4. Update Role
**PATCH** `/api/admin/roles/:id`

**Request Body:**
```json
{
  "permissions": [
    "patient:read:any",
    "appt:read:any",
    "consultation:read:any",
    "prescription:read:any"
  ],
  "description": "Updated description"
}
```

### 5. Delete Role
**DELETE** `/api/admin/roles/:id`

**Note:** Cannot delete if users are assigned to this role

---

## Available Permissions

### Patient Permissions
- `patient:read:any` - Read all patients
- `patient:write:any` - Create/update patients
- `patient:read:self` - Read own patient profile
- `patient:write:self` - Update own patient profile

### Doctor Permissions
- `doctor:read:any` - Read all doctors
- `doctor:write:any` - Create/update doctors
- `doctor:read:self` - Read own doctor profile
- `doctor:write:self` - Update own doctor profile

### Appointment Permissions
- `appt:read:any` - Read all appointments
- `appt:write:any` - Create/update appointments
- `appt:read:self` - Read own appointments
- `appt:write:self` - Manage own appointments
- `appt:status:complete` - Mark as completed
- `appt:status:cancel` - Cancel appointments

### Consultation Permissions
- `consultation:read:any` - Read all consultations
- `consultation:write:any` - Create/update consultations
- `consultation:read:self` - Read own consultations

### Prescription Permissions
- `prescription:read:any` - Read all prescriptions
- `prescription:write:any` - Create/update prescriptions
- `prescription:read:self` - Read own prescriptions
- `prescription:sign` - Sign prescriptions
- `prescription:dispense` - Dispense medications

### Pharmacy Permissions
- `pharmacy:read:any` - Read all pharmacies
- `pharmacy:write:any` - Create/update pharmacies
- `pharmacy:manage` - Manage pharmacy
- `pharmacy:prescriptions` - View pharmacy prescriptions

### Laboratory Permissions
- `lab:order:read:any` - Read all lab orders
- `lab:order:write:any` - Create/update lab orders
- `lab:order:read:self` - Read own lab orders
- `lab:result:read:any` - Read all lab results
- `lab:result:write:any` - Create/update lab results
- `lab:result:read:self` - Read own lab results
- `lab:result:validate` - Validate lab results

### Document Permissions
- `document:read:any` - Read all documents
- `document:write:any` - Upload/update documents
- `document:read:self` - Read own documents
- `document:delete` - Delete documents
- `document:verify` - Verify documents

### Admin Permissions
- `role:manage` - Manage roles
- `user:manage` - Manage users
- `availability:read:any` - Read all availability

---

## Default Roles

### Admin
Full system access with all permissions

### Doctor
```json
{
  "name": "doctor",
  "permissions": [
    "patient:read:any",
    "patient:write:any",
    "doctor:read:any",
    "doctor:read:self",
    "doctor:write:self",
    "appt:read:any",
    "appt:write:any",
    "appt:status:complete",
    "appt:status:cancel",
    "consultation:read:any",
    "consultation:write:any",
    "prescription:read:any",
    "prescription:write:any",
    "prescription:sign",
    "lab:order:read:any",
    "lab:order:write:any",
    "lab:result:read:any",
    "document:read:any",
    "document:write:any",
    "document:verify"
  ]
}
```

### Nurse
```json
{
  "name": "nurse",
  "permissions": [
    "patient:read:any",
    "patient:write:any",
    "appt:read:any",
    "appt:write:any",
    "consultation:read:any",
    "lab:order:read:any",
    "lab:result:read:any",
    "document:read:any",
    "document:write:any"
  ]
}
```

### Patient
```json
{
  "name": "patient",
  "permissions": [
    "patient:read:self",
    "patient:write:self",
    "appt:read:self",
    "appt:write:self",
    "consultation:read:self",
    "prescription:read:self",
    "lab:order:read:self",
    "lab:result:read:self",
    "document:read:self"
  ]
}
```

### Secretary
```json
{
  "name": "secretary",
  "permissions": [
    "patient:read:any",
    "patient:write:any",
    "doctor:read:any",
    "appt:read:any",
    "appt:write:any",
    "appt:status:cancel",
    "availability:read:any"
  ]
}
```

### Pharmacist
```json
{
  "name": "pharmacist",
  "permissions": [
    "prescription:read:any",
    "prescription:dispense",
    "pharmacy:prescriptions"
  ]
}
```

### Lab Technician
```json
{
  "name": "lab_technician",
  "permissions": [
    "lab:order:read:any",
    "lab:result:read:any",
    "lab:result:write:any",
    "lab:result:validate"
  ]
}
```

---

## Permission Naming Convention

Format: `resource:action:scope`

- **resource**: patient, doctor, appt, prescription, etc.
- **action**: read, write, delete, sign, dispense, etc.
- **scope**: any (all records), self (own records only)

Examples:
- `patient:read:any` - Read all patients
- `patient:read:self` - Read own patient profile
- `prescription:sign` - Sign prescriptions
- `document:verify` - Verify documents

---

## Best Practices

1. **Principle of Least Privilege** - Grant minimum required permissions
2. **Role Hierarchy** - Define clear role hierarchy
3. **Regular Audits** - Review permissions regularly
4. **Custom Roles** - Create custom roles for specific needs
5. **Documentation** - Document role purposes
6. **Testing** - Test permissions thoroughly

---

**Last Updated:** November 2, 2025
