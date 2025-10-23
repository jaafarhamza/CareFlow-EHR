export async function up(db) {
  await db.createCollection('notification_logs', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'type', 'status', 'channel', 'recipient', 'sentAt'],
        properties: {
          userId: { bsonType: 'objectId' },
          appointmentId: { bsonType: ['objectId', 'null'] },
          type: { enum: ['appointment_reminder', 'appointment_confirmation', 'appointment_cancellation', 'password_reset', 'account_activation'] },
          status: { enum: ['sent', 'failed', 'pending'] },
          channel: { enum: ['email', 'sms'] },
          recipient: { bsonType: 'string' },
          subject: { bsonType: ['string', 'null'] },
          errorMessage: { bsonType: ['string', 'null'] },
          meta: { bsonType: ['object', 'null'] },
          dedupeKey: { bsonType: ['string', 'null'] },
          sentAt: { bsonType: 'date' }
        }
      }
    }
  });

  const logs = db.collection('notification_logs');
  await logs.createIndex({ userId: 1, type: 1, sentAt: -1 });
  await logs.createIndex({ appointmentId: 1, type: 1 }, { sparse: true });
  await logs.createIndex({ dedupeKey: 1 }, { unique: true, sparse: true });
  await logs.createIndex({ sentAt: 1 }, { expireAfterSeconds: 7776000 });
}

export async function down(db) {
  await db.collection('notification_logs').drop();
}
