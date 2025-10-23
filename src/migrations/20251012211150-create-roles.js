export async function up(db) {
  await db.createCollection('roles', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'permissions', 'createdAt'],
        properties: {
          name: { bsonType: 'string' },
          permissions: { bsonType: 'array', items: { bsonType: 'string' } },
          description: { bsonType: ['string', 'null'] },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: ['date', 'null'] }
        }
      }
    }
  });

  await db.collection('roles').createIndex({ name: 1 }, { unique: true });
}

export async function down(db) {
  await db.collection('roles').drop();
}
