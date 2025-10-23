export async function up(db) {
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
          expiresAt: { bsonType: 'date' },
          revokedAt: { bsonType: ['date', 'null'] },
          replacedByTokenHash: { bsonType: ['string', 'null'] },
          createdAt: { bsonType: 'date' }
        }
      }
    }
  });

  const tokens = db.collection('refresh_tokens');
  await tokens.createIndex({ tokenHash: 1 }, { unique: true });
  await tokens.createIndex({ userId: 1, revokedAt: 1, expiresAt: 1 });
  await tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

export async function down(db) {
  await db.collection('refresh_tokens').drop();
}
