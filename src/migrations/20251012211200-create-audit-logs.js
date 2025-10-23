export async function up(db) {
  await db.createCollection('audit_logs', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'action', 'resource', 'timestamp'],
        properties: {
          userId: { bsonType: 'objectId' },
          action: { enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'suspend', 'activate'] },
          resource: { enum: ['user', 'patient', 'doctor', 'appointment', 'consultation', 'medical_record'] },
          resourceId: { bsonType: ['objectId', 'null'] },
          changes: { bsonType: ['object', 'null'] },
          ip: { bsonType: ['string', 'null'] },
          userAgent: { bsonType: ['string', 'null'] },
          timestamp: { bsonType: 'date' }
        }
      }
    }
  });

  const audit = db.collection('audit_logs');
  await audit.createIndex({ userId: 1, timestamp: -1 });
  await audit.createIndex({ resource: 1, resourceId: 1, timestamp: -1 });
  await audit.createIndex({ action: 1, timestamp: -1 });
  await audit.createIndex({ timestamp: 1 }, { expireAfterSeconds: 31536000 });
}

export async function down(db) {
  await db.collection('audit_logs').drop();
}
