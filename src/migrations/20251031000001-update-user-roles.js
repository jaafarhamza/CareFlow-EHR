export async function up(db) {
  // Update users collection validator to include new roles
  await db.command({
    collMod: 'users',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['firstName', 'lastName', 'email', 'passwordHash', 'role', 'status', 'isActive', 'createdAt'],
        properties: {
          firstName: { bsonType: 'string', minLength: 2, maxLength: 100 },
          lastName: { bsonType: 'string', minLength: 2, maxLength: 100 },
          email: { bsonType: 'string' },
          phone: { bsonType: ['string', 'null'] },
          role: { enum: ['admin', 'doctor', 'patient', 'nurse', 'secretary', 'pharmacist', 'lab_technician'] },
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
}

export async function down(db) {
  // Revert to original roles
  await db.command({
    collMod: 'users',
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
}
