export async function up(db) {
  await db.createCollection('patients', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'createdAt'],
        properties: {
          userId: { bsonType: 'objectId' },
          dateOfBirth: { bsonType: ['date', 'null'] },
          gender: { enum: ['male', 'female', null] },
          bloodType: { enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null] },
          address: {
            bsonType: ['object', 'null'],
            properties: {
              line1: { bsonType: ['string', 'null'] },
              line2: { bsonType: ['string', 'null'] },
              city: { bsonType: ['string', 'null'] },
              state: { bsonType: ['string', 'null'] },
              postalCode: { bsonType: ['string', 'null'] },
              country: { bsonType: ['string', 'null'] }
            }
          },
          emergencyContact: {
            bsonType: ['object', 'null'],
            properties: {
              name: { bsonType: ['string', 'null'] },
              phone: { bsonType: ['string', 'null'] },
              relationship: { bsonType: ['string', 'null'] }
            }
          },
          insurance: {
            bsonType: ['object', 'null'],
            properties: {
              provider: { bsonType: ['string', 'null'] },
              policyNumber: { bsonType: ['string', 'null'] },
              groupNumber: { bsonType: ['string', 'null'] }
            }
          },
          allergies: { bsonType: ['array', 'null'], items: { bsonType: 'string' } },
          chronicConditions: { bsonType: ['array', 'null'], items: { bsonType: 'string' } },
          medications: { bsonType: ['array', 'null'], items: { bsonType: 'string' } },
          consents: {
            bsonType: ['object', 'null'],
            properties: {
              dataProcessing: { bsonType: ['bool', 'null'] },
              marketing: { bsonType: ['bool', 'null'] },
              care: { bsonType: ['bool', 'null'] }
            }
          },
          preferences: {
            bsonType: ['object', 'null'],
            properties: {
              language: { bsonType: ['string', 'null'] },
              communication: { enum: ['email', 'sms', 'phone', null] }
            }
          },
          createdBy: { bsonType: ['objectId', 'null'] },
          updatedBy: { bsonType: ['objectId', 'null'] },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: ['date', 'null'] }
        }
      }
    }
  });

  const patients = db.collection('patients');
  await patients.createIndex({ userId: 1 }, { unique: true });
  await patients.createIndex({ dateOfBirth: 1 });
}

export async function down(db) {
  await db.collection('patients').drop();
}
