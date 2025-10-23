export async function up(db) {
  await db.createCollection('availability_slots', {
    validator: {
      $and: [
        {
          $jsonSchema: {
            bsonType: 'object',
            required: ['doctorId', 'startAt', 'endAt', 'type', 'createdAt'],
            properties: {
              doctorId: { bsonType: 'objectId' },
              startAt: { bsonType: 'date' },
              endAt: { bsonType: 'date' },
              type: { enum: ['available', 'blocked', 'vacation'] },
              reason: { bsonType: ['string', 'null'] },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: ['date', 'null'] }
            }
          }
        },
        { $expr: { $lt: ['$startAt', '$endAt'] } }
      ]
    }
  });

  const slots = db.collection('availability_slots');
  await slots.createIndex({ doctorId: 1, startAt: 1, endAt: 1 }, { unique: true });
  await slots.createIndex({ doctorId: 1, type: 1, startAt: 1 });
  await slots.createIndex({ startAt: 1 }, { expireAfterSeconds: 7776000 });
}

export async function down(db) {
  await db.collection('availability_slots').drop();
}
