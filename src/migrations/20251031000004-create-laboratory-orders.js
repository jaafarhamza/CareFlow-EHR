export async function up(db) {
  await db.createCollection('laboratoryorders');

  const laboratoryOrders = db.collection('laboratoryorders');
  
  // Create indexes
  await laboratoryOrders.createIndex({ orderNumber: 1 }, { unique: true });
  await laboratoryOrders.createIndex({ consultationId: 1 });
  await laboratoryOrders.createIndex({ patientId: 1, orderDate: -1 });
  await laboratoryOrders.createIndex({ doctorId: 1, orderDate: -1 });
  await laboratoryOrders.createIndex({ status: 1, priority: 1, orderDate: 1 });
  await laboratoryOrders.createIndex({ laboratoryId: 1, status: 1 });
}

export async function down(db) {
  await db.collection('laboratoryorders').drop();
}
