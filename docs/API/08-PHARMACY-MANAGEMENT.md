# Pharmacy Management API Documentation

## Overview
Manage partner pharmacies and track prescription dispensation.

---

## Base URL
```
http://localhost:5000/api/pharmacies
```

---

## Endpoints

### 1. List Pharmacies
**GET** `/api/pharmacies`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "672403c9d8e5b8d4e0a1b2d5",
        "name": "City Pharmacy",
        "licenseNumber": "PH123456",
        "address": {
          "street": "789 Pharmacy St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001"
        },
        "phone": "+1234567890",
        "email": "contact@citypharmacy.com",
        "workingHours": {
          "monday": {"open": "08:00", "close": "20:00"},
          "tuesday": {"open": "08:00", "close": "20:00"}
        },
        "isActive": true
      }
    ]
  }
}
```

### 2. Create Pharmacy
**POST** `/api/pharmacies`

**Permission:** Admin only

**Request Body:**
```json
{
  "name": "City Pharmacy",
  "licenseNumber": "PH123456",
  "address": {
    "street": "789 Pharmacy St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "phone": "+1234567890",
  "email": "contact@citypharmacy.com",
  "website": "https://citypharmacy.com",
  "workingHours": {
    "monday": {"open": "08:00", "close": "20:00"},
    "tuesday": {"open": "08:00", "close": "20:00"},
    "wednesday": {"open": "08:00", "close": "20:00"},
    "thursday": {"open": "08:00", "close": "20:00"},
    "friday": {"open": "08:00", "close": "20:00"},
    "saturday": {"open": "09:00", "close": "18:00"},
    "sunday": {"open": "10:00", "close": "16:00"}
  },
  "services": ["Prescription filling", "Consultations", "Delivery"]
}
```

### 3. Get Pharmacy by ID
**GET** `/api/pharmacies/:id`

### 4. Get Pharmacy Prescriptions
**GET** `/api/pharmacies/:id/prescriptions`

**Permission:** Pharmacist of that pharmacy

**Query Parameters:**
- `status` - Filter by status
- `fromDate`, `toDate` - Date range
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "672403c9d8e5b8d4e0a1b2e0",
        "patientId": {...},
        "doctorId": {...},
        "medications": [...],
        "status": "sent",
        "createdAt": "2025-11-02T10:00:00Z"
      }
    ],
    "total": 15,
    "pending": 5,
    "dispensed": 10
  }
}
```

### 5. Update Pharmacy
**PATCH** `/api/pharmacies/:id`

**Permission:** Admin or Pharmacy manager

### 6. Delete Pharmacy
**DELETE** `/api/pharmacies/:id`

**Permission:** Admin only

---

## Working Hours Format

```json
{
  "monday": {"open": "08:00", "close": "20:00"},
  "tuesday": {"open": "08:00", "close": "20:00"},
  "wednesday": {"open": "08:00", "close": "20:00"},
  "thursday": {"open": "08:00", "close": "20:00"},
  "friday": {"open": "08:00", "close": "20:00"},
  "saturday": {"open": "09:00", "close": "18:00"},
  "sunday": {"open": "10:00", "close": "16:00", "closed": false}
}
```

---

## Pharmacy Services

Common services:
- Prescription filling
- Medication counseling
- Immunizations
- Health screenings
- Home delivery
- 24/7 availability
- Compounding services
- Medical equipment

---

## Pharmacist Workflow

### View Pending Prescriptions
```bash
GET /api/pharmacies/{pharmacyId}/prescriptions?status=sent
```

### Dispense Prescription
```bash
POST /api/prescriptions/{prescriptionId}/dispense
Body: {
  "dispensedBy": "Pharmacist Name",
  "notes": "All medications provided"
}
```

### Notify Patient
System automatically sends notification when prescription is ready

---

**Last Updated:** November 2, 2025
