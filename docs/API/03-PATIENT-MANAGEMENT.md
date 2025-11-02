# Patient Management API Documentation

## Overview
The Patient Management API handles patient profiles, medical history, allergies, and related information.

---

## Base URL
```
http://localhost:5000/api/patients
```

---

## Endpoints

### 1. List Patients
**GET** `/api/patients`

**Permissions:** `PATIENT_READ_ANY` (staff) or `PATIENT_READ_SELF` (patient)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string) - Search by name, email, or phone
- `bloodType` (string) - Filter by blood type
- `gender` (string) - Filter by gender
- `sortBy` (string, default: 'createdAt')
- `sortOrder` (string: 'asc' | 'desc', default: 'desc')

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "6903b694610a2dd1e89735ba",
        "userId": {
          "_id": "6903b693610a2dd1e89735a4",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phone": "+1234567890"
        },
        "dateOfBirth": "1990-05-15",
        "gender": "male",
        "bloodType": "A+",
        "allergies": ["Penicillin", "Peanuts"],
        "chronicConditions": ["Hypertension"],
        "emergencyContact": {
          "name": "Jane Doe",
          "relationship": "Spouse",
          "phone": "+1234567891"
        },
        "createdAt": "2025-11-01T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

### 2. Create Patient
**POST** `/api/patients`

**Permissions:** `PATIENT_WRITE_ANY`

**Request Body:**
```json
{
  "userId": "6903b693610a2dd1e89735a4",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "bloodType": "A+",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+1234567891"
  },
  "allergies": ["Penicillin"],
  "chronicConditions": ["Hypertension"],
  "currentMedications": ["Lisinopril 10mg"],
  "insuranceInfo": {
    "provider": "Blue Cross",
    "policyNumber": "BC123456789",
    "groupNumber": "GRP001"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "_id": "6903b694610a2dd1e89735ba",
    "userId": {...},
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "bloodType": "A+",
    "allergies": ["Penicillin"],
    "chronicConditions": ["Hypertension"],
    "createdAt": "2025-11-02T10:00:00Z"
  }
}
```

---

### 3. Get Patient by ID
**GET** `/api/patients/:id`

**Permissions:** `PATIENT_READ_ANY` or `PATIENT_READ_SELF`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "6903b694610a2dd1e89735ba",
    "userId": {
      "_id": "6903b693610a2dd1e89735a4",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890"
    },
    "dateOfBirth": "1990-05-15",
    "age": 35,
    "gender": "male",
    "bloodType": "A+",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "+1234567891"
    },
    "allergies": ["Penicillin", "Peanuts"],
    "chronicConditions": ["Hypertension"],
    "currentMedications": ["Lisinopril 10mg"],
    "pastMedicalHistory": ["Appendectomy 2015"],
    "familyHistory": ["Father: Heart Disease"],
    "insuranceInfo": {
      "provider": "Blue Cross",
      "policyNumber": "BC123456789",
      "groupNumber": "GRP001",
      "expiryDate": "2026-12-31"
    },
    "createdAt": "2025-11-01T10:00:00Z",
    "updatedAt": "2025-11-02T10:00:00Z"
  }
}
```

---

### 4. Get Patient by User ID
**GET** `/api/patients/user/:userId`

**Permissions:** `PATIENT_READ_ANY` or `PATIENT_READ_SELF`

**Response:** `200 OK` (same as Get Patient by ID)

---

### 5. Update Patient
**PATCH** `/api/patients/:id`

**Permissions:** `PATIENT_WRITE_ANY` or `PATIENT_WRITE_SELF`

**Request Body:** (all fields optional)
```json
{
  "address": {
    "street": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "country": "USA"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+1234567892"
  },
  "allergies": ["Penicillin", "Peanuts", "Shellfish"],
  "currentMedications": ["Lisinopril 10mg", "Aspirin 81mg"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "data": {
    "_id": "6903b694610a2dd1e89735ba",
    "address": {...},
    "emergencyContact": {...},
    "allergies": ["Penicillin", "Peanuts", "Shellfish"],
    "updatedAt": "2025-11-02T11:00:00Z"
  }
}
```

---

### 6. Delete Patient
**DELETE** `/api/patients/:id`

**Permissions:** `PATIENT_WRITE_ANY`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Patient deleted successfully"
}
```

**Note:** This is a soft delete

---

## Data Models

### Patient Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | ObjectId | Yes | Reference to User |
| `dateOfBirth` | Date | Yes | Date of birth |
| `gender` | String | Yes | male, female, other |
| `bloodType` | String | No | A+, A-, B+, B-, AB+, AB-, O+, O- |
| `address` | Object | No | Physical address |
| `emergencyContact` | Object | Yes | Emergency contact info |
| `allergies` | Array | No | List of allergies |
| `chronicConditions` | Array | No | Chronic conditions |
| `currentMedications` | Array | No | Current medications |
| `pastMedicalHistory` | Array | No | Past medical history |
| `familyHistory` | Array | No | Family medical history |
| `insuranceInfo` | Object | No | Insurance details |

### Address Object
```json
{
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}
```

### Emergency Contact Object
```json
{
  "name": "Jane Doe",
  "relationship": "Spouse",
  "phone": "+1234567891",
  "email": "jane.doe@example.com"
}
```

### Insurance Info Object
```json
{
  "provider": "Blue Cross",
  "policyNumber": "BC123456789",
  "groupNumber": "GRP001",
  "expiryDate": "2026-12-31"
}
```

---

## Example Usage

### Create Patient Profile

```bash
# 1. Create patient
curl -X POST http://localhost:5000/api/patients \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "6903b693610a2dd1e89735a4",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "bloodType": "A+",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "+1234567891"
    },
    "allergies": ["Penicillin"],
    "chronicConditions": ["Hypertension"]
  }'

# 2. Get patient details
curl -X GET http://localhost:5000/api/patients/6903b694610a2dd1e89735ba \
  -H "Authorization: Bearer {token}"

# 3. Update patient
curl -X PATCH http://localhost:5000/api/patients/6903b694610a2dd1e89735ba \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "allergies": ["Penicillin", "Peanuts", "Shellfish"],
    "currentMedications": ["Lisinopril 10mg", "Aspirin 81mg"]
  }'
```

### Search and Filter

```bash
# Search by name
curl -X GET "http://localhost:5000/api/patients?search=john" \
  -H "Authorization: Bearer {token}"

# Filter by blood type
curl -X GET "http://localhost:5000/api/patients?bloodType=A+" \
  -H "Authorization: Bearer {token}"

# Filter by gender
curl -X GET "http://localhost:5000/api/patients?gender=male" \
  -H "Authorization: Bearer {token}"

# Pagination
curl -X GET "http://localhost:5000/api/patients?page=2&limit=10" \
  -H "Authorization: Bearer {token}"
```

---

## Validation Rules

### Create Patient
- `userId`: Required, must be valid user ID
- `dateOfBirth`: Required, must be valid date, cannot be future
- `gender`: Required, must be: male, female, other
- `bloodType`: Optional, must be valid blood type
- `emergencyContact.name`: Required
- `emergencyContact.phone`: Required, valid format
- `allergies`: Optional, array of strings
- `chronicConditions`: Optional, array of strings

### Update Patient
- All fields optional
- Cannot update userId or dateOfBirth
- Same validation rules apply to updated fields

---

## Access Control

### Staff (Doctors, Nurses, Secretaries)
- ✅ Can view all patients
- ✅ Can create patients
- ✅ Can update patients
- ✅ Can delete patients

### Patients
- ✅ Can view own profile
- ✅ Can update own profile
- ❌ Cannot view other patients
- ❌ Cannot create/delete patients

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "details": [
    {
      "message": "Date of birth cannot be in the future",
      "path": ["dateOfBirth"]
    }
  ]
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to access this patient"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Patient not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Patient profile already exists for this user"
}
```

---

## Best Practices

1. **Complete profiles** - Fill all relevant medical information
2. **Update allergies** - Keep allergy list current
3. **Emergency contacts** - Always have valid emergency contact
4. **Insurance info** - Keep insurance details updated
5. **Privacy** - Patients can only see their own data
6. **Medical history** - Document thoroughly
7. **Regular updates** - Update medications and conditions

---

**Last Updated:** November 2, 2025
