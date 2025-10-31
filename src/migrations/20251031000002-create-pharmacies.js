export async function up(db) {
  await db.createCollection('pharmacies');

  const pharmacies = db.collection('pharmacies');
  
  // Create indexes
  await pharmacies.createIndex({ name: 1 });
  await pharmacies.createIndex({ licenseNumber: 1 }, { unique: true });
  await pharmacies.createIndex({ isActive: 1, name: 1 });
  await pharmacies.createIndex({ 'address.city': 1, isActive: 1 });
  await pharmacies.createIndex({ location: '2dsphere' });
}

export async function down(db) {
  await db.collection('pharmacies').drop();
}
