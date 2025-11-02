# Consultation Management API Documentation

## Overview
Document medical consultations with vital signs, diagnoses, and treatment plans.

---

## Base URL
```
http://localhost:5000/api/consultations
```

---

## Endpoints

### 1. List Consultations
**GET** `/api/consultations`

### 2. Create Consultation
**POST** `/api/consultations`

**Request Body:**
```json
{
  "appointmentId": "672403c9d8e5b8d4e0a1b2c3",
  "patientId": "6903b694610a2dd1e89735ba",
  "doctorId": "6903b694610a2dd1e89735c0",
  "vitalSigns": {
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "heartRate": 72,
    "temperature": 36.6,
    "weight": 70,
    "height": 175,
    "respiratoryRate": 16,
    "oxygenSaturation": 98
  },
  "chiefComplaint": "Persistent headache for 3 days",
  "historyOfPresentIllness": "Patient reports throbbing headache...",
  "physicalExamination": "Alert and oriented, no acute distress...",
  "diagnosis": ["Tension headache"],
  "treatmentPlan": "Rest, hydration, OTC pain relievers",
  "procedures": ["Blood pressure measurement"],
  "followUpDate": "2025-11-20",
  "notes": "Patient advised to return if symptoms worsen"
}
```

**Response:** `201 Created`

### 3. Get Consultation by ID
**GET** `/api/consultations/:id`

### 4. Get Consultation by Appointment
**GET** `/api/consultations/appointment/:appointmentId`

### 5. Update Consultation
**PATCH** `/api/consultations/:id`

### 6. Delete Consultation
**DELETE** `/api/consultations/:id`

---

## Vital Signs

### Blood Pressure
```json
{
  "systolic": 120,
  "diastolic": 80,
  "unit": "mmHg"
}
```

### Temperature
- Value in Celsius
- Normal range: 36.1 - 37.2°C

### Heart Rate
- Value in beats per minute (bpm)
- Normal range: 60-100 bpm

### Oxygen Saturation
- Value in percentage
- Normal range: 95-100%

---

## SOAP Notes

### Subjective
- Chief complaint
- History of present illness
- Review of systems

### Objective
- Vital signs
- Physical examination findings
- Lab results

### Assessment
- Diagnosis
- Differential diagnosis

### Plan
- Treatment plan
- Medications
- Follow-up

---

**Last Updated:** November 2, 2025
