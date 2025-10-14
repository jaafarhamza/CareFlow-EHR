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
    await db.createCollection('appointments', {
      validator: {
        $and: [
          {
            $jsonSchema: {
              bsonType: 'object',
              required: ['patientId', 'doctorId', 'startAt', 'endAt', 'status', 'createdAt'],
              properties: {
                patientId: { bsonType: 'objectId' },
                doctorId: { bsonType: 'objectId' },
                startAt: { bsonType: 'date' },
                endAt: { bsonType: 'date' },
                status: { bsonType: 'string', enum: ['scheduled', 'completed', 'cancelled'] },
                reason: { bsonType: 'string' },
                locationId: { bsonType: ['objectId', 'null'] },
                type: { bsonType: ['string', 'null'], enum: ['in_person', 'virtual', null] },
                meetingLink: { bsonType: ['string', 'null'] },
                cancellationReason: { bsonType: ['string', 'null'] },
                cancelledAt: { bsonType: ['date', 'null'] },
                completedAt: { bsonType: ['date', 'null'] },
                createdBy: { bsonType: 'objectId' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: ['date', 'null'] },
                updatedBy: { bsonType: ['objectId', 'null'] },
              },
            },
          },
          { $expr: { $lt: ['$startAt', '$endAt'] } }
        ],
      },
    });
    await db.collection('appointments').createIndex({ doctorId: 1, startAt: 1, endAt: 1 });
    await db.collection('appointments').createIndex({ patientId: 1, startAt: 1 });
    await db.collection('appointments').createIndex({ status: 1, startAt: 1 });
    await db.collection('appointments').createIndex(
      { doctorId: 1, startAt: 1, endAt: 1 },
      { unique: true, partialFilterExpression: { status: 'scheduled' }, name: 'uniq_doctor_slot_scheduled' }
    );
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
    await db.collection('appointments').drop();
  }
};
