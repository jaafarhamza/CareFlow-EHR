# Document Management API Documentation

## Overview
Secure medical document storage with file upload, presigned URLs, tagging, and verification.

---

## Base URL
```
http://localhost:5000/api/documents
```

---

## Endpoints

### 1. Upload Document
**POST** `/api/documents`

**Permission:** `DOCUMENT_WRITE_ANY`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file, required) - Document file (max 20MB)
- `patientId` (string, required)
- `documentType` (string, required)
- `title` (string, required)
- `description` (string, optional)
- `tags` (array, optional)
- `relatedTo` (string, optional)
- `relatedId` (string, optional)
- `expiresAt` (date, optional)

**Allowed File Types:**
- PDF (`.pdf`)
- Images (`.jpg`, `.jpeg`, `.png`, `.gif`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)

**Example:**
```bash
curl -X POST http://localhost:5000/api/documents \
  -H "Authorization: Bearer {token}" \
  -F "file=@report.pdf" \
  -F "patientId=6903b694610a2dd1e89735ba" \
  -F "documentType=lab_report" \
  -F "title=Blood Test Report" \
  -F "description=CBC results from 2025-11-02" \
  -F "tags[]=hematology" \
  -F "tags[]=routine"
```

**Response:** `201 Created`

### 2. List Documents
**GET** `/api/documents`

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder`
- `patientId`, `uploadedBy`, `documentType`
- `isVerified` - true/false
- `includeDeleted` - true/false
- `relatedTo`, `relatedId`
- `tags` - Filter by tags
- `fromDate`, `toDate`
- `search` - Search title, description, fileName

### 3. Get Document by ID
**GET** `/api/documents/:id`

### 4. Update Document
**PATCH** `/api/documents/:id`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["new-tag1", "new-tag2"],
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

### 5. Soft Delete Document
**DELETE** `/api/documents/:id`

**Request Body:**
```json
{
  "reason": "Duplicate document"
}
```

### 6. Restore Deleted Document
**POST** `/api/documents/:id/restore`

**Permission:** Admin only

### 7. Permanently Delete Document
**DELETE** `/api/documents/:id/permanent`

**Permission:** Admin only

**Note:** Deletes file from storage and database permanently

### 8. Verify Document
**POST** `/api/documents/:id/verify`

**Permission:** `DOCUMENT_VERIFY` (doctors, admins)

**Request Body:**
```json
{
  "notes": "Document verified and authentic"
}
```

### 9. Unverify Document
**POST** `/api/documents/:id/unverify`

**Permission:** Admin only

### 10. Download Document
**GET** `/api/documents/:id/download`

**Response:**
```json
{
  "success": true,
  "data": {
    "fileName": "report.pdf",
    "fileUrl": "medical-documents/1762108539945-abc123-report.pdf",
    "mimeType": "application/pdf"
  }
}
```

### 11. Generate Presigned URL
**GET** `/api/documents/:id/presigned-url`

**Query Parameters:**
- `expiresIn` (number, 60-86400 seconds, default: 3600)

**Response:**
```json
{
  "success": true,
  "data": {
    "presignedUrl": "http://localhost:9000/careflow-documents/...",
    "expiresIn": 3600,
    "expiresAt": "2025-11-02T18:00:00Z"
  }
}
```

### 12. Add Tags
**POST** `/api/documents/:id/tags`

**Request Body:**
```json
{
  "tags": ["urgent", "follow-up"]
}
```

### 13. Remove Tags
**DELETE** `/api/documents/:id/tags`

**Request Body:**
```json
{
  "tags": ["routine"]
}
```

### 14. Get Documents by Patient
**GET** `/api/documents/patient/:patientId`

### 15. Get Documents by Type
**GET** `/api/documents/type/:type`

### 16. Get Documents by Tags
**GET** `/api/documents/tags?tags=urgent&tags=follow-up`

### 17. Get Unverified Documents
**GET** `/api/documents/unverified`

### 18. Get Statistics
**GET** `/api/documents/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1250,
    "deleted": 45,
    "verified": 980,
    "unverified": 270,
    "totalSizeBytes": 524288000,
    "totalSizeMB": "500.00",
    "byType": {
      "lab_report": 450,
      "radiology_report": 320,
      "prescription": 280
    }
  }
}
```

---

## Document Types

- `lab_report` - Laboratory test reports
- `radiology_report` - X-ray, CT, MRI reports
- `prescription` - Prescription documents
- `medical_certificate` - Medical certificates
- `discharge_summary` - Hospital discharge summaries
- `consent_form` - Patient consent forms
- `insurance_document` - Insurance-related documents
- `referral_letter` - Doctor referral letters
- `vaccination_record` - Vaccination records
- `other` - Other medical documents

---

## Presigned URLs

Generate temporary secure download links:

**Benefits:**
- ✅ No authentication required for the link
- ✅ Time-limited access (1 min - 24 hours)
- ✅ Secure sharing with external parties
- ✅ Automatic expiration

**Example:**
```bash
GET /api/documents/{id}/presigned-url?expiresIn=3600
```

Anyone with the presigned URL can download the file for 1 hour without logging in.

---

## Access Logging

Every document access is automatically logged:

```json
{
  "accessLog": [
    {
      "userId": "...",
      "action": "view",
      "accessedAt": "2025-11-02T16:00:00Z"
    },
    {
      "userId": "...",
      "action": "download",
      "accessedAt": "2025-11-02T16:30:00Z"
    },
    {
      "userId": "...",
      "action": "share",
      "accessedAt": "2025-11-02T17:00:00Z"
    }
  ]
}
```

**Actions:**
- `view` - Document viewed
- `download` - Document downloaded
- `share` - Presigned URL generated

---

## Tagging Best Practices

### Good Tags:
- `urgent` - Requires immediate attention
- `follow-up` - Needs follow-up action
- `routine` - Regular checkup
- `chronic` - Related to chronic condition
- `emergency` - Emergency case
- `insurance` - Insurance-related
- `lab` - Laboratory tests
- `radiology` - Radiology reports

### Tag Guidelines:
- Use lowercase
- Keep tags short (max 50 characters)
- Be consistent
- Use hyphens for multi-word tags

---

## Access Control

| Role | Permissions |
|------|-------------|
| **Admin** | Full access (upload, read all, update, delete, restore, verify, permanent delete) |
| **Doctor** | Upload, read all, verify |
| **Nurse** | Upload, read all |
| **Patient** | Read own documents only |
| **Secretary** | Read all |

---

**Last Updated:** November 2, 2025
