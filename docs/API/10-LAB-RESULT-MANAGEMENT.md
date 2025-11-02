# Lab Result Management API Documentation

## Overview
Manage laboratory test results with PDF reports, abnormal flags, and validation workflow.

---

## Base URL
```
http://localhost:5000/api/lab-results
```

---

## Endpoints

### 1. List Lab Results
**GET** `/api/lab-results`

**Query Parameters:**
- `patientId`, `doctorId`, `labOrderId`
- `status` - pending, validated, amended
- `hasAbnormalResults` - true/false
- `hasCriticalValues` - true/false
- `fromDate`, `toDate`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "672403c9d8e5b8d4e0a1b2d0",
        "labOrderId": {...},
        "patientId": {...},
        "doctorId": {...},
        "performedDate": "2025-11-03T10:00:00Z",
        "results": [
          {
            "testCode": "CBC",
            "testName": "Complete Blood Count",
            "components": [
              {
                "name": "WBC",
                "value": 7.5,
                "unit": "10^9/L",
                "normalRange": "4.0-11.0",
                "isAbnormal": false
              },
              {
                "name": "Hemoglobin",
                "value": 10.5,
                "unit": "g/dL",
                "normalRange": "12.0-16.0",
                "isAbnormal": true,
                "flag": "L"
              }
            ]
          }
        ],
        "hasAbnormalResults": true,
        "hasCriticalValues": false,
        "status": "validated"
      }
    ]
  }
}
```

### 2. Create Lab Result
**POST** `/api/lab-results`

**Permission:** Lab technician

**Request Body:**
```json
{
  "labOrderId": "672403c9d8e5b8d4e0a1b2c8",
  "patientId": "6903b694610a2dd1e89735ba",
  "doctorId": "6903b694610a2dd1e89735c0",
  "performedDate": "2025-11-03T10:00:00Z",
  "performedBy": "Lab Tech Name",
  "results": [
    {
      "testCode": "CBC",
      "testName": "Complete Blood Count",
      "category": "Hematology",
      "components": [
        {
          "name": "WBC",
          "value": 7.5,
          "unit": "10^9/L",
          "normalRange": "4.0-11.0",
          "referenceRange": {
            "min": 4.0,
            "max": 11.0
          }
        },
        {
          "name": "Hemoglobin",
          "value": 10.5,
          "unit": "g/dL",
          "normalRange": "12.0-16.0",
          "referenceRange": {
            "min": 12.0,
            "max": 16.0
          },
          "flag": "L",
          "isCritical": false
        }
      ]
    }
  ],
  "interpretation": "Mild anemia detected",
  "recommendations": "Iron supplementation recommended",
  "technicalNotes": "Sample processed within 2 hours"
}
```

**Response:** `201 Created`

### 3. Get Lab Result by ID
**GET** `/api/lab-results/:id`

### 4. Update Lab Result
**PATCH** `/api/lab-results/:id`

**Note:** Can only update if status is 'pending'

### 5. Validate Lab Result
**POST** `/api/lab-results/:id/validate`

**Permission:** Lab supervisor or doctor

**Request Body:**
```json
{
  "validatedBy": "Dr. Smith",
  "validationNotes": "Results reviewed and approved"
}
```

### 6. Upload PDF Report
**POST** `/api/lab-results/:id/upload-pdf`

**Permission:** Lab technician

**Content-Type:** `multipart/form-data`

**Form Data:**
- `pdf` (file) - PDF report file

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "PDF report uploaded successfully",
  "data": {
    "pdfReport": {
      "fileName": "lab-report-1730556000000.pdf",
      "fileUrl": "lab-reports/1730556000000-abc123-report.pdf",
      "fileSize": 245678,
      "uploadedAt": "2025-11-03T11:00:00Z"
    }
  }
}
```

### 7. Download PDF Report
**GET** `/api/lab-results/:id/download-pdf`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "fileName": "lab-report-1730556000000.pdf",
    "fileUrl": "lab-reports/1730556000000-abc123-report.pdf",
    "presignedUrl": "http://localhost:9000/..."
  }
}
```

### 8. Delete Lab Result
**DELETE** `/api/lab-results/:id`

---

## Result Flags

| Flag | Meaning | Description |
|------|---------|-------------|
| `N` | Normal | Within normal range |
| `L` | Low | Below normal range |
| `H` | High | Above normal range |
| `LL` | Critical Low | Critically low |
| `HH` | Critical High | Critically high |
| `A` | Abnormal | Abnormal (non-numeric) |

---

## Critical Values

Values that require immediate attention:

### Hematology
- WBC < 2.0 or > 30.0 (10^9/L)
- Hemoglobin < 7.0 or > 20.0 (g/dL)
- Platelets < 50 or > 1000 (10^9/L)

### Chemistry
- Glucose < 40 or > 500 (mg/dL)
- Potassium < 2.5 or > 6.5 (mmol/L)
- Sodium < 120 or > 160 (mmol/L)
- Creatinine > 5.0 (mg/dL)

---

## Result Status

| Status | Description |
|--------|-------------|
| `pending` | Awaiting validation |
| `validated` | Approved by supervisor |
| `amended` | Corrected after validation |
| `cancelled` | Result cancelled |

---

## Abnormal Result Workflow

1. **Lab creates result** → System detects abnormal values
2. **Flag abnormal components** → `isAbnormal: true`
3. **Check for critical values** → `isCritical: true`
4. **Notify doctor** → Immediate notification for critical
5. **Validate result** → Supervisor reviews
6. **Notify patient** → Results available

---

## PDF Report Requirements

- **Format:** PDF only
- **Max Size:** 20MB
- **Content:** Official lab letterhead
- **Includes:** All test results, reference ranges, flags

---

## Notifications

### Critical Values
- ✅ Immediate phone call to doctor
- ✅ Urgent notification in system
- ✅ Email alert

### Normal Results
- ✅ Notification when validated
- ✅ Patient can view in portal

### Abnormal (Non-Critical)
- ✅ Doctor notified
- ✅ Flagged for review

---

## Example Usage

```bash
# 1. Create lab result
curl -X POST http://localhost:5000/api/lab-results \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{...}'

# 2. Upload PDF report
curl -X POST http://localhost:5000/api/lab-results/{id}/upload-pdf \
  -H "Authorization: Bearer {token}" \
  -F "pdf=@report.pdf"

# 3. Validate result
curl -X POST http://localhost:5000/api/lab-results/{id}/validate \
  -H "Authorization: Bearer {token}" \
  -d '{"validatedBy": "Dr. Smith"}'

# 4. Download PDF
curl -X GET http://localhost:5000/api/lab-results/{id}/download-pdf \
  -H "Authorization: Bearer {token}"
```

---

**Last Updated:** November 2, 2025
