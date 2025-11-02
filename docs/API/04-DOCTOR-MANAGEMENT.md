# Doctor Management API Documentation

## Overview
Manage doctor profiles, specializations, availability, and working hours.

---

## Base URL
```
http://localhost:5000/api/doctors
```

---

## Endpoints

### 1. List Doctors
**GET** `/api/doctors`

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder`
- `specialization` - Filter by specialization
- `isAvailable` - Filter by availability (true/false)
- `search` - Search by name or specialization

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "6903b694610a2dd1e89735c0",
        "userId": {
          "firstName": "Dr. Sarah",
          "lastName": "Johnson",
          "email": "sarah.johnson@hospital.com"
        },
        "specialization": "Cardiology",
        "licenseNumber": "MD123456",
        "department": "Cardiology",
        "yearsOfExperience": 10,
        "consultationDurationMinutes": 30,
        "isAvailable": true
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20
  }
}
```

### 2. Create Doctor
**POST** `/api/doctors`

**Request Body:**
```json
{
  "userId": "6903b693610a2dd1e89735a4",
  "specialization": "Cardiology",
  "licenseNumber": "MD123456",
  "department": "Cardiology",
  "yearsOfExperience": 10,
  "consultationDurationMinutes": 30,
  "workingHours": {
    "monday": [{"start": "09:00", "end": "17:00"}],
    "tuesday": [{"start": "09:00", "end": "17:00"}],
    "wednesday": [{"start": "09:00", "end": "17:00"}],
    "thursday": [{"start": "09:00", "end": "17:00"}],
    "friday": [{"start": "09:00", "end": "13:00"}]
  },
  "bufferMinutes": 10,
  "maxDailyAppointments": 16
}
```

**Response:** `201 Created`

### 3. Get Doctor by ID
**GET** `/api/doctors/:id`

### 4. Get Doctor by User ID
**GET** `/api/doctors/user/:userId`

### 5. Update Doctor
**PATCH** `/api/doctors/:id`

### 6. Delete Doctor
**DELETE** `/api/doctors/:id`

---

## Working Hours Format

```json
{
  "monday": [
    {"start": "09:00", "end": "12:00"},
    {"start": "14:00", "end": "17:00"}
  ],
  "tuesday": [{"start": "09:00", "end": "17:00"}],
  "wednesday": [],
  "thursday": [{"start": "09:00", "end": "17:00"}],
  "friday": [{"start": "09:00", "end": "13:00"}],
  "saturday": [],
  "sunday": []
}
```

---

## Specializations

Common specializations:
- Cardiology
- Dermatology
- Endocrinology
- Gastroenterology
- General Practice
- Neurology
- Oncology
- Orthopedics
- Pediatrics
- Psychiatry
- Radiology
- Surgery

---

**Last Updated:** November 2, 2025
