export async function up(db) {
  await db.createCollection('consultations', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['appointmentId', 'doctorId', 'patientId', 'createdAt'],
        properties: {
          appointmentId: { bsonType: 'objectId' },
          doctorId: { bsonType: 'objectId' },
          patientId: { bsonType: 'objectId' },
          chiefComplaint: { bsonType: ['string', 'null'] },
          diagnosis: { bsonType: ['string', 'null'] },
          prescriptions: {
            bsonType: ['array', 'null'],
            items: {
              bsonType: 'object',
              properties: {
                medication: { bsonType: 'string' },
                dosage: { bsonType: 'string' },
                frequency: { bsonType: 'string' },
                duration: { bsonType: 'string' }
              }
            }
          },
          labOrders: { bsonType: ['array', 'null'], items: { bsonType: 'string' } },
          notes: { bsonType: ['string', 'null'] },
          followUpRequired: { bsonType: ['bool', 'null'] },
          followUpAt: { bsonType: ['date', 'null'] },
          vitals: {
            bsonType: ['object', 'null'],
            properties: {
              heightCm: { bsonType: ['double', 'int', 'null'] },
              weightKg: { bsonType: ['double', 'int', 'null'] },
              temperatureC: { bsonType: ['double', 'int', 'null'] },
              systolicBp: { bsonType: ['int', 'null'] },
              diastolicBp: { bsonType: ['int', 'null'] },
              heartRateBpm: { bsonType: ['int', 'null'] },
              respiratoryRate: { bsonType: ['int', 'null'] },
              oxygenSaturation: { bsonType: ['int', 'null'] }
            }
          },
          attachments: {
            bsonType: ['array', 'null'],
            items: {
              bsonType: 'object',
              properties: {
                url: { bsonType: 'string' },
                type: { bsonType: ['string', 'null'] },
                uploadedAt: { bsonType: ['date', 'null'] }
              }
            }
          },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: ['date', 'null'] }
        }
      }
    }
  });

  const consultations = db.collection('consultations');
  await consultations.createIndex({ appointmentId: 1 }, { unique: true });
  await consultations.createIndex({ patientId: 1, createdAt: -1 });
  await consultations.createIndex({ doctorId: 1, createdAt: -1 });
  await consultations.createIndex({ followUpRequired: 1, followUpAt: 1 }, { sparse: true });
}

export async function down(db) {
  await db.collection('consultations').drop();
}
