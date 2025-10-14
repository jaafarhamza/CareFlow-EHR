module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection('notification_logs', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'type', 'sentAt'],
          properties: {
            userId: { bsonType: 'objectId' },
            appointmentId: { bsonType: ['objectId', 'null'] },
            type: { bsonType: 'string', description: 'e.g. appointment_reminder' },
            meta: { bsonType: ['object', 'null'] },
            sentAt: { bsonType: 'date' },
            dedupeKey: { bsonType: ['string', 'null'] }
          }
        }
      }
    });
    await db.collection('notification_logs').createIndex({ userId: 1, type: 1, sentAt: 1 });
    await db.collection('notification_logs').createIndex({ appointmentId: 1, type: 1, sentAt: 1 });
    await db.collection('notification_logs').createIndex({ dedupeKey: 1 }, { unique: true, sparse: true, name: 'uniq_dedupeKey' });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection('notification_logs').drop();
  }
};



