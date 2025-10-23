export async function up(db) {
  await db.createCollection('users', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['firstName', 'lastName', 'email', 'passwordHash', 'role', 'status', 'isActive', 'createdAt'],
        properties: {
          firstName: { bsonType: 'string', minLength: 2, maxLength: 100 },
          lastName: { bsonType: 'string', minLength: 2, maxLength: 100 },
          email: { bsonType: 'string' },
          phone: { bsonType: ['string', 'null'] },
          role: { enum: ['admin', 'doctor', 'patient', 'nurse', 'secretary'] },
          status: { enum: ['active', 'suspended', 'deleted'] },
          isActive: { bsonType: 'bool' },
          passwordHash: { bsonType: 'string' },
          lastLoginAt: { bsonType: ['date', 'null'] },
          resetCodeHash: { bsonType: ['string', 'null'] },
          resetCodeExpiresAt: { bsonType: ['date', 'null'] },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: ['date', 'null'] }
        }
      }
    }
  });

  const users = db.collection('users');
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ role: 1, status: 1, isActive: 1 });
  await users.createIndex({ phone: 1 }, { sparse: true });
  await users.createIndex({ resetCodeHash: 1 }, { sparse: true });
}

export async function down(db) {
  await db.collection('users').drop();
}
