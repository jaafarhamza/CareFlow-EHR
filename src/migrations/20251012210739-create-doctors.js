const timeSlot = {
  bsonType: 'object',
  required: ['start', 'end'],
  properties: {
    start: { bsonType: 'string' },
    end: { bsonType: 'string' }
  }
};

export async function up(db) {
  await db.createCollection('doctors', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'specialization', 'licenseNumber', 'createdAt'],
        properties: {
          userId: { bsonType: 'objectId' },
          specialization: { bsonType: 'string' },
          licenseNumber: { bsonType: 'string' },
          department: { bsonType: ['string', 'null'] },
          yearsOfExperience: { bsonType: ['int', 'null'], minimum: 0 },
          consultationDurationMinutes: { bsonType: ['int', 'null'], minimum: 5, maximum: 480 },
          workingHours: {
            bsonType: ['object', 'null'],
            properties: {
              monday: { bsonType: ['array', 'null'], items: timeSlot },
              tuesday: { bsonType: ['array', 'null'], items: timeSlot },
              wednesday: { bsonType: ['array', 'null'], items: timeSlot },
              thursday: { bsonType: ['array', 'null'], items: timeSlot },
              friday: { bsonType: ['array', 'null'], items: timeSlot },
              saturday: { bsonType: ['array', 'null'], items: timeSlot },
              sunday: { bsonType: ['array', 'null'], items: timeSlot }
            }
          },
          bufferMinutes: { bsonType: ['int', 'null'], minimum: 0 },
          maxDailyAppointments: { bsonType: ['int', 'null'], minimum: 1 },
          isAvailable: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: ['date', 'null'] }
        }
      }
    }
  });

  const doctors = db.collection('doctors');
  await doctors.createIndex({ userId: 1 }, { unique: true });
  await doctors.createIndex({ licenseNumber: 1 }, { unique: true });
  await doctors.createIndex({ specialization: 1, isAvailable: 1 });
}

export async function down(db) {
  await db.collection('doctors').drop();
}
