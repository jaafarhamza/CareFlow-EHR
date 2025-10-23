export async function up(db) {
  await db.createCollection('appointments', {
    validator: {
      $and: [
        {
          $jsonSchema: {
            bsonType: 'object',
            required: ['patientId', 'doctorId', 'startAt', 'endAt', 'status', 'createdBy', 'createdAt'],
            properties: {
              patientId: { bsonType: 'objectId' },
              doctorId: { bsonType: 'objectId' },
              startAt: { bsonType: 'date' },
              endAt: { bsonType: 'date' },
              status: { enum: ['scheduled', 'completed', 'cancelled', 'no_show'] },
              type: { enum: ['in_person', 'virtual', null] },
              reason: { bsonType: ['string', 'null'] },
              notes: { bsonType: ['string', 'null'] },
              meetingLink: { bsonType: ['string', 'null'] },
              cancellationReason: { bsonType: ['string', 'null'] },
              cancelledAt: { bsonType: ['date', 'null'] },
              cancelledBy: { bsonType: ['objectId', 'null'] },
              completedAt: { bsonType: ['date', 'null'] },
              reminderSentAt: { bsonType: ['date', 'null'] },
              createdBy: { bsonType: 'objectId' },
              updatedBy: { bsonType: ['objectId', 'null'] },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: ['date', 'null'] }
            }
          }
        },
        { $expr: { $lt: ['$startAt', '$endAt'] } }
      ]
    }
  });

  const appointments = db.collection('appointments');
  await appointments.createIndex({ doctorId: 1, startAt: 1, status: 1 });
  await appointments.createIndex({ patientId: 1, startAt: -1, status: 1 });
  await appointments.createIndex({ status: 1, startAt: 1, reminderSentAt: 1 });
}

export async function down(db) {
  await db.collection('appointments').drop();
}
