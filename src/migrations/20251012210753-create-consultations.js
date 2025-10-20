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
  await db.createCollection('consultations', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['appointmentId', 'doctorId', 'patientId', 'createdAt'],
        properties: {
          appointmentId: { bsonType: 'objectId' },
          doctorId: { bsonType: 'objectId' },
          patientId: { bsonType: 'objectId' },
          diagnosis: { bsonType: 'string' },
          prescriptions: {
            bsonType: 'array',
            items: { bsonType: 'string' },
          },
          notes: { bsonType: 'string' },
          followUpRequired: { bsonType: 'bool' },
          followUpAt: { bsonType: ['date', 'null'] },
          vitals: {
            bsonType: ['object', 'null'],
            properties: {
              heightCm: { bsonType: ['double', 'int', 'null'] },
              weightKg: { bsonType: ['double', 'int', 'null'] },
              temperatureC: { bsonType: ['double', 'int', 'null'] },
              systolicBp: { bsonType: ['int', 'null'] },
              diastolicBp: { bsonType: ['int', 'null'] },
              heartRateBpm: { bsonType: ['int', 'null'] }
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
          updatedAt: { bsonType: ['date', 'null'] },
        },
      },
    },
  });
  await db.collection('consultations').createIndex({ appointmentId: 1 }, { unique: true });
  await db.collection('consultations').createIndex({ patientId: 1, createdAt: 1 });
  await db.collection('consultations').createIndex({ doctorId: 1, createdAt: 1 });
  await db.collection('consultations').createIndex({ followUpAt: 1 }, { name: 'by_followUpAt' });
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
  await db.collection('consultations').drop();
}
