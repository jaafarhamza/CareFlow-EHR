export async function up(db) {
  await db.createCollection('laboratoryresults');

  const laboratoryResults = db.collection('laboratoryresults');
  
  // Create indexes
  await laboratoryResults.createIndex({ orderId: 1, status: 1 });
  await laboratoryResults.createIndex({ patientId: 1, reportDate: -1 });
  await laboratoryResults.createIndex({ status: 1, reportDate: -1 });
  await laboratoryResults.createIndex({ criticalValues: 1, criticalValueNotifiedAt: 1 });
}

export async function down(db) {
  await db.collection('laboratoryresults').drop();
}
