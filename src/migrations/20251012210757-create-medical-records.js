export async function up(db) {
  await db.createCollection('medical_records', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['patientId', 'createdAt'],
        properties: {
          patientId: { bsonType: 'objectId' },
          medicalHistory: {
            bsonType: ['array', 'null'],
            items: {
              bsonType: 'object',
              properties: {
                condition: { bsonType: 'string' },
                diagnosedAt: { bsonType: ['date', 'null'] },
                notes: { bsonType: ['string', 'null'] }
              }
            }
          },
          surgicalHistory: {
            bsonType: ['array', 'null'],
            items: {
              bsonType: 'object',
              properties: {
                procedure: { bsonType: 'string' },
                date: { bsonType: ['date', 'null'] },
                notes: { bsonType: ['string', 'null'] }
              }
            }
          },
          familyHistory: {
            bsonType: ['array', 'null'],
            items: {
              bsonType: 'object',
              properties: {
                condition: { bsonType: 'string' },
                relation: { bsonType: 'string' }
              }
            }
          },
          immunizations: {
            bsonType: ['array', 'null'],
            items: {
              bsonType: 'object',
              properties: {
                vaccine: { bsonType: 'string' },
                date: { bsonType: ['date', 'null'] },
                nextDue: { bsonType: ['date', 'null'] }
              }
            }
          },
          labResults: {
            bsonType: ['array', 'null'],
            items: {
              bsonType: 'object',
              properties: {
                testName: { bsonType: 'string' },
                result: { bsonType: 'string' },
                date: { bsonType: ['date', 'null'] },
                orderedBy: { bsonType: ['objectId', 'null'] },
                attachmentUrl: { bsonType: ['string', 'null'] }
              }
            }
          },
          documents: {
            bsonType: ['array', 'null'],
            items: {
              bsonType: 'object',
              properties: {
                title: { bsonType: 'string' },
                type: { bsonType: 'string' },
                url: { bsonType: 'string' },
                uploadedAt: { bsonType: 'date' },
                uploadedBy: { bsonType: ['objectId', 'null'] }
              }
            }
          },
          primaryPhysicianId: { bsonType: ['objectId', 'null'] },
          updatedBy: { bsonType: ['objectId', 'null'] },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: ['date', 'null'] }
        }
      }
    }
  });

  const records = db.collection('medical_records');
  await records.createIndex({ patientId: 1 }, { unique: true });
  await records.createIndex({ primaryPhysicianId: 1 });
}

export async function down(db) {
  await db.collection('medical_records').drop();
}
