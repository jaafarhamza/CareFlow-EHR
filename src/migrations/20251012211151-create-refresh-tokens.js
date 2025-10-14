module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection('refresh_tokens', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'tokenHash', 'expiresAt', 'createdAt'],
          properties: {
            userId: { bsonType: 'objectId' },
            tokenHash: { bsonType: 'string' },
            deviceId: { bsonType: ['string', 'null'] },
            ip: { bsonType: ['string', 'null'] },
            userAgent: { bsonType: ['string', 'null'] },
            createdAt: { bsonType: 'date' },
            expiresAt: { bsonType: 'date' },
            revokedAt: { bsonType: ['date', 'null'] },
            replacedByTokenHash: { bsonType: ['string', 'null'] }
          }
        }
      }
    });
    await db.collection('refresh_tokens').createIndex({ userId: 1, expiresAt: 1 });
    await db.collection('refresh_tokens').createIndex({ tokenHash: 1 }, { unique: true });
    await db.collection('refresh_tokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db.collection('refresh_tokens').createIndex({ userId: 1, revokedAt: 1, expiresAt: 1 }, { name: 'by_user_revoked_expiry' });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection('refresh_tokens').drop();
  }
};



