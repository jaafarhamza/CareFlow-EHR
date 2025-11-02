# Appointment Management API Documentation

## Overview
Schedule, manage, and track patient appointments with automatic conflict detection.

---

## Base URL
```
http://localhost:5000/api/appointments
```

---

## Endpoints

### 1. List Appointments
**GET** `/api/appointments`

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder`
- `patientId` - Filter by patient
- `doctorId` - Filter by doctor
- `status` - Filter by status
- `fromDate`, `toDate` - Date range
- `search` - Search by patient or doctor name

**Response:** `200 OK`

### 2. Create Appointment
**POST** `/api/appointments`

**Request Body:**
```json
{
  "patientId": "6903b694610a2dd1e89735ba",
  "doctorId": "6903b694610a2dd1e89735c0",
  "appointmentDate": "2025-11-10",
  "appointmentTime": "10:00",
  "duration": 30,
  "reason": "Annual checkup",
  "notes": "Patient reports mild headaches"
}
```

**Response:** `201 Created` or `409 Conflict` (if time slot unavailable)

### 3. Check Availability
**GET** `/api/appointments/availability`

**Query Parameters:**
- `doctorId` (required)
- `date` (required, format: YYYY-MM-DD)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "date": "2025-11-10",
    "availableSlots": [
      {"start": "09:00", "end": "09:30"},
      {"start": "09:30", "end": "10:00"},
      {"start": "10:30", "end": "11:00"}
    ],
    "bookedSlots": [
      {"start": "10:00", "end": "10:30", "patientName": "John Doe"}
    ]
  }
}
```

### 4. Get Appointment by ID
**GET** `/api/appointments/:id`

### 5. Update Appointment
**PATCH** `/api/appointments/:id`

### 6. Cancel Appointment
**POST** `/api/appointments/:id/cancel`

**Request Body:**
```json
{
  "reason": "Patient requested cancellation"
}
```

### 7. Complete Appointment
**POST** `/api/appointments/:id/complete`

**Request Body:**
```json
{
  "notes": "Consultation completed successfully"
}
```

---

## Appointment Statuses

| Status | Description |
|--------|-------------|
| `scheduled` | Appointment booked |
| `confirmed` | Patient confirmed |
| `in_progress` | Currently happening |
| `completed` | Finished successfully |
| `cancelled` | Cancelled by patient/doctor |
| `no_show` | Patient didn't show up |

---

## Conflict Detection

The system automatically prevents:
- ✅ Double booking same doctor
- ✅ Booking outside working hours
- ✅ Overlapping appointments
- ✅ Booking in the past

**Error Response:** `409 Conflict`
```json
{
  "success": false,
  "message": "Time slot not available",
  "conflictingAppointment": {
    "id": "...",
    "time": "10:00",
    "patientName": "John Doe"
  }
}
```

---

## Notifications

### Email Reminders
- ✅ Sent 24 hours before appointment
- ✅ Includes appointment details
- ✅ Cancellation link

### Confirmation Emails
- ✅ Sent immediately after booking
- ✅ Calendar invite attached

---

**Last Updated:** November 2, 2025
