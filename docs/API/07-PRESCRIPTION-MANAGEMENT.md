# Prescription Management API Documentation

## Overview
Create, manage, and track digital prescriptions with pharmacy integration.

---

## Base URL
```
http://localhost:5000/api/prescriptions
```

---

## Endpoints

### 1. List Prescriptions
**GET** `/api/prescriptions`

**Query Parameters:**
- `patientId`, `doctorId`, `pharmacyId`
- `status` - draft, signed, sent, dispensed
- `fromDate`, `toDate`

### 2. Create Prescription
**POST** `/api/prescriptions`

**Request Body:**
```json
{
  "patientId": "6903b694610a2dd1e89735ba",
  "doctorId": "6903b694610a2dd1e89735c0",
  "consultationId": "672403c9d8e5b8d4e0a1b2c3",
  "medications": [
    {
      "name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "route": "oral",
      "instructions": "Take with food",
      "quantity": 21
    }
  ],
  "diagnosis": "Bacterial infection",
  "notes": "Complete full course even if feeling better",
  "allowRefills": true,
  "refillsAllowed": 2
}
```

**Response:** `201 Created`

### 3. Sign Prescription
**POST** `/api/prescriptions/:id/sign`

**Request Body:**
```json
{
  "signature": "Dr. Sarah Johnson",
  "signatureDate": "2025-11-02T10:00:00Z"
}
```

**Response:** `200 OK`

### 4. Send to Pharmacy
**POST** `/api/prescriptions/:id/send`

**Request Body:**
```json
{
  "pharmacyId": "672403c9d8e5b8d4e0a1b2d5"
}
```

### 5. Mark as Dispensed
**POST** `/api/prescriptions/:id/dispense`

**Permission:** Pharmacist only

**Request Body:**
```json
{
  "dispensedBy": "Pharmacist Name",
  "dispensedDate": "2025-11-02T14:00:00Z",
  "notes": "All medications provided"
}
```

### 6. Get Prescription by ID
**GET** `/api/prescriptions/:id`

### 7. Update Prescription
**PATCH** `/api/prescriptions/:id`

**Note:** Can only update draft prescriptions

### 8. Delete Prescription
**DELETE** `/api/prescriptions/:id`

---

## Prescription Statuses

| Status | Description | Who Can Change |
|--------|-------------|----------------|
| `draft` | Being created | Doctor |
| `signed` | Digitally signed | Doctor |
| `sent` | Sent to pharmacy | Doctor/System |
| `dispensed` | Medications given | Pharmacist |
| `cancelled` | Cancelled | Doctor |

---

## Medication Routes

- `oral` - By mouth
- `topical` - Applied to skin
- `intravenous` - IV injection
- `intramuscular` - IM injection
- `subcutaneous` - Under skin
- `inhalation` - Inhaled
- `rectal` - Rectal administration
- `ophthalmic` - Eye drops
- `otic` - Ear drops

---

## Frequency Options

- `once daily` - QD
- `twice daily` - BID
- `3 times daily` - TID
- `4 times daily` - QID
- `every 4 hours` - Q4H
- `every 6 hours` - Q6H
- `every 8 hours` - Q8H
- `as needed` - PRN
- `at bedtime` - HS

---

## Digital Signature

Prescriptions must be digitally signed before sending to pharmacy:

```json
{
  "signature": "Dr. Sarah Johnson",
  "signatureDate": "2025-11-02T10:00:00Z",
  "licenseNumber": "MD123456"
}
```

---

## Pharmacy Integration

### Workflow
1. Doctor creates prescription (status: `draft`)
2. Doctor signs prescription (status: `signed`)
3. System sends to pharmacy (status: `sent`)
4. Pharmacist dispenses (status: `dispensed`)

### Notifications
- ✅ Patient notified when sent to pharmacy
- ✅ Patient notified when ready for pickup
- ✅ Pharmacist notified of new prescription

---

**Last Updated:** November 2, 2025
