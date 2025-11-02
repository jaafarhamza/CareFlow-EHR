# Authentication API Documentation

## Overview
The Authentication API handles user registration, login, token management, password reset, and OAuth integration.

---

## Base URL
```
http://localhost:5000/api/auth
```

---

## Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "role": "patient"
}
```

**Validation Rules:**
- `firstName`: Required, 2-100 characters
- `lastName`: Required, 2-100 characters
- `email`: Required, valid email format
- `password`: Required, min 8 chars, must contain uppercase, lowercase, number, special char
- `phone`: Optional, valid international format
- `role`: Optional, defaults to "patient"

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "6903b693610a2dd1e89735a4",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "patient",
      "status": "active",
      "isActive": true,
      "createdAt": "2025-11-02T10:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400` - Validation error
- `409` - Email already exists

---

### 2. Login
**POST** `/api/auth/login`

**Description:** Authenticate user and receive tokens

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6903b693610a2dd1e89735a4",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "patient",
      "lastLoginAt": "2025-11-02T10:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** Refresh token is also set as httpOnly cookie

**Errors:**
- `400` - Invalid credentials
- `401` - Account locked (after 5 failed attempts)
- `403` - Account suspended

---

### 3. Refresh Token
**POST** `/api/auth/refresh`

**Description:** Get new access token using refresh token

**Request:** Refresh token from cookie or body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `401` - Invalid or expired refresh token

---

### 4. Logout
**POST** `/api/auth/logout`

**Description:** Logout user and invalidate refresh token

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 5. Forgot Password
**POST** `/api/auth/forgot-password`

**Description:** Request password reset code via email

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset code sent to email"
}
```

**Note:** 6-digit code valid for 15 minutes

**Errors:**
- `404` - User not found

---

### 6. Reset Password
**POST** `/api/auth/reset-password`

**Description:** Reset password using code from email

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Errors:**
- `400` - Invalid or expired code
- `404` - User not found

---

### 7. Google OAuth Login
**GET** `/api/auth/google`

**Description:** Initiate Google OAuth flow

**Response:** Redirects to Google login page

---

### 8. Google OAuth Callback
**GET** `/api/auth/google/callback`

**Description:** Handle Google OAuth callback

**Response:** Redirects to client with tokens

---

## Token Information

### Access Token
- **Lifetime:** 15 minutes
- **Usage:** Include in Authorization header for protected routes
- **Format:** `Bearer {token}`

### Refresh Token
- **Lifetime:** 7 days
- **Usage:** Get new access token when expired
- **Storage:** httpOnly cookie (secure)

---

## Security Features

### Account Lockout
- **Trigger:** 5 failed login attempts
- **Duration:** 15 minutes
- **Reset:** Automatic after lockout period

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting
- Login: 5 requests per 15 minutes per IP
- Register: 3 requests per hour per IP
- Password reset: 3 requests per hour per IP

---

## Example Usage

### Register and Login Flow

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "role": "patient"
  }'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'

# 3. Use access token
curl -X GET http://localhost:5000/api/patients \
  -H "Authorization: Bearer {accessToken}"

# 4. Refresh token when expired
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{refreshToken}"
  }'

# 5. Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer {accessToken}"
```

### Password Reset Flow

```bash
# 1. Request reset code
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'

# 2. Check email for 6-digit code

# 3. Reset password
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "code": "123456",
    "newPassword": "NewSecurePass123!"
  }'
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "details": [
    {
      "message": "Password must be at least 8 characters",
      "path": ["password"]
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Account is suspended"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

---

## Best Practices

1. **Store tokens securely** - Never expose in client-side code
2. **Use HTTPS** - Always in production
3. **Implement token refresh** - Before access token expires
4. **Handle 401 errors** - Redirect to login
5. **Clear tokens on logout** - Remove from storage
6. **Validate password strength** - Client-side validation
7. **Rate limit requests** - Prevent brute force attacks

---

**Last Updated:** November 2, 2025
