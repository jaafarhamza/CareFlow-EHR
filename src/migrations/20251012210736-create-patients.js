export
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async function up(db, client) {
  // TODO write your migration here.
  // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  await db.createCollection('patients', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'createdAt'],
        properties: {
          userId: { bsonType: 'objectId' },
          dateOfBirth: { bsonType: 'date' },
          gender: { bsonType: ['string', 'null'], enum: ['male', 'female'] },
          contactInfo: {
            bsonType: 'object',
            properties: {
              firstName: { bsonType: ['string', 'null'] },
              lastName: { bsonType: ['string', 'null'] },
              email: { bsonType: ['string', 'null'] },
              phone: { bsonType: ['string', 'null'] },
              address: {
                bsonType: ['object', 'null'],
                properties: {
                  line1: { bsonType: ['string', 'null'] },
                  line2: { bsonType: ['string', 'null'] },
                  city: { bsonType: ['string', 'null'] },
                  state: { bsonType: ['string', 'null'] },
                  postalCode: { bsonType: ['string', 'null'] },
                  country: { bsonType: ['string', 'null'] },
                }
              }
            }
          },
          consents: {
            bsonType: 'object',
            properties: {
              dataProcessing: { bsonType: ['bool', 'null'] },
              marketing: { bsonType: ['bool', 'null'] },
              care: { bsonType: ['bool', 'null'] }
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
          emergencyContact: {
            bsonType: ['object', 'null'],
            properties: {
              name: { bsonType: ['string', 'null'] },
              phone: { bsonType: ['string', 'null'] },
              relationship: { bsonType: ['string', 'null'] }
            }
          },
          preferences: {
            bsonType: ['object', 'null'],
            properties: {
              language: { bsonType: ['string', 'null'] },
              communication: { bsonType: ['string', 'null'] }
            }
          },
          allergies: { bsonType: ['array', 'null'], items: { bsonType: 'string' } },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: ['date', 'null'] },
          createdBy: { bsonType: ['objectId', 'null'] },
          updatedBy: { bsonType: ['objectId', 'null'] },
        },
      },
    },
  });
  await db.collection('patients').createIndex({ userId: 1 }, { unique: true });
  await db.collection('patients').createIndex({ 'contactInfo.lastName': 1 });
  await db.collection('patients').createIndex({ dateOfBirth: 1 });
  await db.collection('patients').createIndex({ 'contactInfo.lastName': 1, dateOfBirth: 1 }, { name: 'by_lastName_dob' });
  await db.collection('patients').createIndex({
    'contactInfo.firstName': 'text',
    'contactInfo.lastName': 'text',
    'contactInfo.email': 'text',
    'allergies': 'text'
  }, { name: 'patient_text_search' });
}
export
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async function down(db, client) {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  await db.collection('patients').drop();
}
