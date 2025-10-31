export async function up(db) {
  await db.createCollection('medicaldocuments');

  const medicalDocuments = db.collection('medicaldocuments');
  
  // Create indexes
  await medicalDocuments.createIndex({ fileKey: 1 }, { unique: true });
  await medicalDocuments.createIndex({ patientId: 1, documentDate: -1, isDeleted: 1 });
  await medicalDocuments.createIndex({ patientId: 1, category: 1, isDeleted: 1 });
  await medicalDocuments.createIndex({ uploadedBy: 1, createdAt: -1 });
  await medicalDocuments.createIndex({ tags: 1, isDeleted: 1 });
  await medicalDocuments.createIndex({ 'relatedTo.resourceType': 1, 'relatedTo.resourceId': 1 });
  await medicalDocuments.createIndex({ isDeleted: 1 });
}

export async function down(db) {
  await db.collection('medicaldocuments').drop();
}
