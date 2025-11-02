# Lab Order Management API Documentation

## Overview
Create and manage laboratory test orders with automatic numbering and status tracking.

---

## Base URL
```
http://localhost:5000/api/lab-orders
```

---

## Endpoints

### 1. List Lab Orders
**GET** `/api/lab-orders`

**Query Parameters:**
- `patientId`, `doctorId`, `assignedTo`
- `status` - ordered, received, in_progress, completed, cancelled
- `priority` - routine, urgent, stat
- `fromDate`, `toDate`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "672403c9d8e5b8d4e0a1b2c8",
        "orderNumber": "LAB-2025-00001",
        "patientId": {...},
        "doctorId": {...},
        "tests": [
          {
            "testCode": "CBC",
            "testName": "Complete Blood Count",
            "category": "Hematology"
          },
          {
            "testCode": "BMP",
            "testName": "Basic Metabolic Panel",
            "category": "Chemistry"
          }
        ],
        "priority": "routine",
        "status": "ordered",
        "orderDate": "2025-11-02T10:00:00Z",
        "expectedDate": "2025-11-04T10:00:00Z"
      }
    ],
    "total": 50
  }
}
```

### 2. Create Lab Order
**POST** `/api/lab-orders`

**Request Body:**
```json
{
  "consultationId": "672403c9d8e5b8d4e0a1b2c3",
  "patientId": "6903b694610a2dd1e89735ba",
  "doctorId": "6903b694610a2dd1e89735c0",
  "tests": [
    {
      "testCode": "CBC",
      "testName": "Complete Blood Count",
      "category": "Hematology",
      "instructions": "Fasting not required"
    },
    {
      "testCode": "BMP",
      "testName": "Basic Metabolic Panel",
      "category": "Chemistry",
      "instructions": "8-hour fasting required"
    }
  ],
  "priority": "routine",
  "clinicalNotes": "Patient reports fatigue",
  "fastingRequired": true,
  "specialInstructions": "Morning collection preferred"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Lab order created successfully",
  "data": {
    "_id": "672403c9d8e5b8d4e0a1b2c8",
    "orderNumber": "LAB-2025-00001",
    "patientId": {...},
    "tests": [...],
    "status": "ordered",
    "orderDate": "2025-11-02T10:00:00Z"
  }
}
```

### 3. Get Lab Order by ID
**GET** `/api/lab-orders/:id`

### 4. Update Lab Order
**PATCH** `/api/lab-orders/:id`

**Note:** Can only update if status is 'ordered'

### 5. Mark as Received
**POST** `/api/lab-orders/:id/receive`

**Permission:** Lab technician

**Request Body:**
```json
{
  "receivedBy": "Lab Tech Name",
  "sampleCondition": "Good",
  "notes": "Samples received in good condition"
}
```

### 6. Mark as Completed
**POST** `/api/lab-orders/:id/complete`

**Permission:** Lab technician

### 7. Cancel Lab Order
**DELETE** `/api/lab-orders/:id`

**Request Body:**
```json
{
  "reason": "Patient cancelled"
}
```

---

## Lab Order Statuses

| Status | Description | Next Action |
|--------|-------------|-------------|
| `ordered` | Order created | Collect sample |
| `received` | Sample received | Process tests |
| `in_progress` | Tests running | Complete tests |
| `completed` | Results ready | Review results |
| `cancelled` | Order cancelled | - |

---

## Priority Levels

| Priority | Description | Expected Time |
|----------|-------------|---------------|
| `routine` | Normal processing | 2-3 days |
| `urgent` | Fast processing | 24 hours |
| `stat` | Immediate | 2-4 hours |

---

## Common Lab Tests

### Hematology
- CBC (Complete Blood Count)
- ESR (Erythrocyte Sedimentation Rate)
- PT/INR (Prothrombin Time)
- Blood Type & Rh

### Chemistry
- BMP (Basic Metabolic Panel)
- CMP (Comprehensive Metabolic Panel)
- Lipid Panel
- Liver Function Tests
- Kidney Function Tests
- HbA1c (Diabetes)

### Microbiology
- Blood Culture
- Urine Culture
- Throat Swab
- Wound Culture

### Serology
- HIV Test
- Hepatitis Panel
- COVID-19 Test

---

## Order Number Format

**Format:** `LAB-YYYY-NNNNN`

**Example:** `LAB-2025-00001`

- Automatically generated
- Sequential numbering
- Year-based reset

---

## Workflow

1. **Doctor creates order** → Status: `ordered`
2. **Lab receives sample** → Status: `received`
3. **Lab processes tests** → Status: `in_progress`
4. **Lab completes tests** → Status: `completed`
5. **Results uploaded** → Lab Result created

---

## Notifications

- ✅ Patient notified when order created
- ✅ Lab notified of new order
- ✅ Doctor notified when results ready
- ✅ Patient notified when results available

---

**Last Updated:** November 2, 2025
