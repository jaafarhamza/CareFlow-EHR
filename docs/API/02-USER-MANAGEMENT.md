# User Management API Documentation

## Overview
The User Management API provides admin-level operations for managing user accounts, roles, and permissions.

**Access:** Admin only

---

## Base URL
```
http://localhost:5000/api/admin/users
```

---

## Endpoints

### 1. List All Users
**GET** `/api/admin/users`

**Permission:** `USER_MANAGE`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `role` (string) - Filter by role
- `status` (string) - Filter by status (active, suspended, deleted)
- `search` (string) - Search by name or email
- `sortBy` (string, default: 'createdAt')
- `sortOrder` (string: 'asc' | 'desc', default: 'desc')

**Example:** `/api/admin/users?role=doctor&status=active&page=1&limit=10`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "6903b693610a2dd1e89735a4",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "role": "doctor",
        "status": "active",
        "isActive": true,
        "lastLoginAt": "2025-11-02T10:00:00Z",
        "createdAt": "2025-11-01T10:00:00Z",
        "updatedAt": "2025-11-02T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 2. Create User
**POST** `/api/admin/users`

**Permission:** `USER_MANAGE`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "role": "nurse",
  "status": "active"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "6903b694610a2dd1e89735b8",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1234567890",
    "role": "nurse",
    "status": "active",
    "isActive": true,
    "createdAt": "2025-11-02T11:00:00Z"
  }
}
```

**Errors:**
- `400` - Validation error
- `409` - Email already exists

---

### 3. Get User by ID
**GET** `/api/admin/users/:id`

**Permission:** `USER_MANAGE`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "6903b693610a2dd1e89735a4",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "doctor",
    "status": "active",
    "isActive": true,
    "lastLoginAt": "2025-11-02T10:00:00Z",
    "failedLoginAttempts": 0,
    "createdAt": "2025-11-01T10:00:00Z",
    "updatedAt": "2025-11-02T10:00:00Z"
  }
}
```

**Errors:**
- `404` - User not found

---

### 4. Update User
**PATCH** `/api/admin/users/:id`

**Permission:** `USER_MANAGE`

**Request Body:** (all fields optional)
```json
{
  "firstName": "John",
  "lastName": "Doe Updated",
  "phone": "+1234567899",
  "role": "doctor",
  "status": "active"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "6903b693610a2dd1e89735a4",
    "firstName": "John",
    "lastName": "Doe Updated",
    "email": "john.doe@example.com",
    "phone": "+1234567899",
    "role": "doctor",
    "status": "active",
    "updatedAt": "2025-11-02T12:00:00Z"
  }
}
```

**Note:** Cannot update email or password through this endpoint

**Errors:**
- `400` - Validation error
- `404` - User not found

---

### 5. Delete User
**DELETE** `/api/admin/users/:id`

**Permission:** `USER_MANAGE`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Note:** This is a soft delete. User status is set to "deleted"

**Errors:**
- `404` - User not found
- `400` - Cannot delete yourself

---

### 6. Suspend User
**POST** `/api/admin/users/:id/suspend`

**Permission:** `USER_MANAGE`

**Request Body:** (optional)
```json
{
  "reason": "Violation of terms"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User suspended successfully",
  "data": {
    "_id": "6903b693610a2dd1e89735a4",
    "status": "suspended",
    "isActive": false
  }
}
```

**Errors:**
- `404` - User not found
- `400` - User already suspended

---

### 7. Activate User
**POST** `/api/admin/users/:id/activate`

**Permission:** `USER_MANAGE`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "_id": "6903b693610a2dd1e89735a4",
    "status": "active",
    "isActive": true
  }
}
```

**Errors:**
- `404` - User not found
- `400` - User already active

---

## User Roles

| Role | Value | Description |
|------|-------|-------------|
| Admin | `admin` | Full system access |
| Doctor | `doctor` | Medical staff |
| Nurse | `nurse` | Nursing staff |
| Patient | `patient` | Patient users |
| Secretary | `secretary` | Administrative staff |
| Pharmacist | `pharmacist` | Pharmacy staff |
| Lab Technician | `lab_technician` | Laboratory staff |

---

## User Statuses

| Status | Description |
|--------|-------------|
| `active` | User can login and use system |
| `suspended` | User cannot login (temporary) |
| `deleted` | User marked as deleted (soft delete) |

---

## Example Usage

### Create and Manage Users

```bash
# 1. Create a doctor
curl -X POST http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Dr. Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@hospital.com",
    "password": "SecurePass123!",
    "phone": "+1234567890",
    "role": "doctor"
  }'

# 2. List all doctors
curl -X GET "http://localhost:5000/api/admin/users?role=doctor&status=active" \
  -H "Authorization: Bearer {adminToken}"

# 3. Update user
curl -X PATCH http://localhost:5000/api/admin/users/6903b693610a2dd1e89735a4 \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567899"
  }'

# 4. Suspend user
curl -X POST http://localhost:5000/api/admin/users/6903b693610a2dd1e89735a4/suspend \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Policy violation"
  }'

# 5. Activate user
curl -X POST http://localhost:5000/api/admin/users/6903b693610a2dd1e89735a4/activate \
  -H "Authorization: Bearer {adminToken}"

# 6. Delete user
curl -X DELETE http://localhost:5000/api/admin/users/6903b693610a2dd1e89735a4 \
  -H "Authorization: Bearer {adminToken}"
```

### Search and Filter

```bash
# Search by name or email
curl -X GET "http://localhost:5000/api/admin/users?search=john" \
  -H "Authorization: Bearer {adminToken}"

# Filter by role and status
curl -X GET "http://localhost:5000/api/admin/users?role=doctor&status=active" \
  -H "Authorization: Bearer {adminToken}"

# Pagination
curl -X GET "http://localhost:5000/api/admin/users?page=2&limit=20" \
  -H "Authorization: Bearer {adminToken}"

# Sort by name
curl -X GET "http://localhost:5000/api/admin/users?sortBy=firstName&sortOrder=asc" \
  -H "Authorization: Bearer {adminToken}"
```

---

## Validation Rules

### Create User
- `firstName`: Required, 2-100 characters
- `lastName`: Required, 2-100 characters
- `email`: Required, valid email, unique
- `password`: Required, min 8 chars with complexity
- `phone`: Optional, valid international format
- `role`: Required, must be valid role
- `status`: Optional, defaults to "active"

### Update User
- All fields optional
- Cannot update email or password
- Role must be valid if provided
- Status must be valid if provided

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "details": [
    {
      "message": "Email must be valid",
      "path": ["email"]
    }
  ]
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

## Best Practices

1. **Validate before creation** - Check if email exists
2. **Use soft delete** - Don't permanently delete users
3. **Log admin actions** - Track who did what
4. **Suspend instead of delete** - For temporary issues
5. **Provide reasons** - When suspending users
6. **Paginate results** - Don't load all users at once
7. **Filter by role** - For role-specific operations

---

## Security Notes

- All endpoints require admin authentication
- Actions are logged in audit trail
- Cannot delete or suspend yourself
- Password changes require separate endpoint
- Email cannot be changed (unique identifier)

---

**Last Updated:** November 2, 2025
