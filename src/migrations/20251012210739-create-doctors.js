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
  await db.createCollection('doctors', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'specialization', 'licenseNumber', 'createdAt'],
        properties: {
          userId: { bsonType: 'objectId' },
          specialization: { bsonType: 'string' },
          licenseNumber: { bsonType: 'string' },
          department: { bsonType: 'string' },
          yearsOfExperience: { bsonType: ['int', 'null'], minimum: 0 },
          consultationDurationMinutes: { bsonType: ['int', 'null'], minimum: 5 },
          workingHours: {
            bsonType: ['object', 'null'],
            description: 'Weekly schedule template per weekday',
            properties: {
              monday: { bsonType: ['array', 'null'], items: { bsonType: 'object', properties: { start: { bsonType: 'string' }, end: { bsonType: 'string' } } } },
              tuesday: { bsonType: ['array', 'null'], items: { bsonType: 'object', properties: { start: { bsonType: 'string' }, end: { bsonType: 'string' } } } },
              wednesday: { bsonType: ['array', 'null'], items: { bsonType: 'object', properties: { start: { bsonType: 'string' }, end: { bsonType: 'string' } } } },
              thursday: { bsonType: ['array', 'null'], items: { bsonType: 'object', properties: { start: { bsonType: 'string' }, end: { bsonType: 'string' } } } },
              friday: { bsonType: ['array', 'null'], items: { bsonType: 'object', properties: { start: { bsonType: 'string' }, end: { bsonType: 'string' } } } },
              saturday: { bsonType: ['array', 'null'], items: { bsonType: 'object', properties: { start: { bsonType: 'string' }, end: { bsonType: 'string' } } } },
              sunday: { bsonType: ['array', 'null'], items: { bsonType: 'object', properties: { start: { bsonType: 'string' }, end: { bsonType: 'string' } } } }
            }
          },
          bufferMinutes: { bsonType: ['int', 'null'] },
          maxDailyAppointments: { bsonType: ['int', 'null'] },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: ['date', 'null'] },
        },
      },
    },
  });
  await db.collection('doctors').createIndex({ userId: 1 }, { unique: true });
  await db.collection('doctors').createIndex({ licenseNumber: 1 }, { unique: true });
  await db.collection('doctors').createIndex({ specialization: 1 });
  await db.collection('doctors').createIndex({ specialization: 1, department: 1 }, { name: 'by_specialization_department' });
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
  await db.collection('doctors').drop();
}
