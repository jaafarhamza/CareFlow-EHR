export async function up(db) {
  await db.createCollection('prescriptions');

  const prescriptions = db.collection('prescriptions');
  
  // Create indexes
  await prescriptions.createIndex({ consultationId: 1 });
  await prescriptions.createIndex({ patientId: 1, prescriptionDate: -1 });
  await prescriptions.createIndex({ doctorId: 1, prescriptionDate: -1 });
  await prescriptions.createIndex({ pharmacyId: 1, status: 1, sentAt: -1 });
  await prescriptions.createIndex({ status: 1, prescriptionDate: -1 });
}

export async function down(db) {
  await db.collection('prescriptions').drop();
}
