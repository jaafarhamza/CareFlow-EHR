module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.createCollection('medical_records', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['patientId', 'lastUpdated'],
          properties: {
            patientId: { bsonType: 'objectId' },
            allergies: { bsonType: 'array', items: { bsonType: 'string' } },
            medicalHistory: { bsonType: 'array', items: { bsonType: 'string' } },
            insurance: { bsonType: 'object' },
            documents: { bsonType: 'array', items: { bsonType: 'object' } },
            chronicConditions: { bsonType: ['array', 'null'], items: { bsonType: 'string' } },
            immunizations: { bsonType: ['array', 'null'], items: { bsonType: 'string' } },
            labResults: { bsonType: ['array', 'null'], items: { bsonType: 'object' } },
            heightCm: { bsonType: ['double', 'int', 'null'] },
            weightKg: { bsonType: ['double', 'int', 'null'] },
            bloodType: { bsonType: ['string', 'null'] },
            primaryPhysicianId: { bsonType: ['objectId', 'null'] },
            lastUpdated: { bsonType: 'date' },
            createdAt: { bsonType: ['date', 'null'] },
            updatedAt: { bsonType: ['date', 'null'] },
            updatedBy: { bsonType: ['objectId', 'null'] },
          },
        },
      },
    });
    await db.collection('medical_records').createIndex({ patientId: 1 }, { unique: true });
    await db.collection('medical_records').createIndex({ lastUpdated: 1 });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    await db.collection('medical_records').drop();
  }
};
