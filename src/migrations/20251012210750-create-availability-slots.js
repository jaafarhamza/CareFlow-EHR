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
    await db.createCollection('availability_slots', {
      validator: {
        $and: [
          {
            $jsonSchema: {
              bsonType: 'object',
              required: ['doctorId', 'startAt', 'endAt', 'isBooked'],
              properties: {
                doctorId: { bsonType: 'objectId' },
                startAt: { bsonType: 'date' },
                endAt: { bsonType: 'date' },
                isBooked: { bsonType: 'bool' },
                locationId: { bsonType: ['objectId', 'null'] },
                createdAt: { bsonType: ['date', 'null'] },
                updatedAt: { bsonType: ['date', 'null'] },
              },
            },
          },
          { $expr: { $lt: ['$startAt', '$endAt'] } }
        ],
      },
    });
    await db.collection('availability_slots').createIndex({ doctorId: 1, startAt: 1, endAt: 1 }, { unique: true });
    await db.collection('availability_slots').createIndex({ doctorId: 1, startAt: 1 });
    await db.collection('availability_slots').createIndex({ doctorId: 1, startAt: 1, isBooked: 1 });
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
    await db.collection('availability_slots').drop();
  }
};
