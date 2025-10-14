module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["email", "passwordHash", "isActive", "createdAt"],
          properties: {
            email: { bsonType: "string", pattern: "^.+@.+\\..+$" },
            passwordHash: { bsonType: "string" },
            isActive: { bsonType: "bool" },
            roles: {
              bsonType: "array",
              items: { bsonType: "objectId" },
            },
            profile: {
              bsonType: "object",
              properties: {
                firstName: { bsonType: ["string", "null"] },
                lastName: { bsonType: ["string", "null"] },
                phone: { bsonType: ["string", "null"] },
                avatarUrl: { bsonType: ["string", "null"] },
              },
            },
            lastLoginAt: { bsonType: ["date", "null"] },
            failedLoginAttempts: { bsonType: ["int", "long", "null"] },
            lockedUntil: { bsonType: ["date", "null"] },
            suspendedAt: { bsonType: ["date", "null"] },
            suspendedBy: { bsonType: ["objectId", "null"] },
            suspensionReason: { bsonType: ["string", "null"] },
            resetToken: { bsonType: ["string", "null"] },
            resetTokenExpiresAt: { bsonType: ["date", "null"] },
            emailVerified: { bsonType: ["bool", "null"] },
            emailVerifiedAt: { bsonType: ["date", "null"] },
            verificationToken: { bsonType: ["string", "null"] },
            verificationTokenExpiresAt: { bsonType: ["date", "null"] },
            createdBy: { bsonType: ["objectId", "null"] },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: ["date", "null"] },
          },
        },
      },
    });

    await db.collection("users").createIndex({ email: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
    await db.collection("users").createIndex({ "profile.lastName": 1 });
    await db.collection("users").createIndex({ isActive: 1 });
    await db.collection("users").createIndex({ resetTokenExpiresAt: 1 });
    await db.collection("users").createIndex({ resetToken: 1 }, { sparse: true, name: "by_resetToken" });
    await db.collection("users").createIndex({ verificationToken: 1 }, { sparse: true, name: "by_verificationToken" });
    await db.collection("users").createIndex({ createdAt: 1 }, { name: "by_createdAt" });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    await db.collection("users").drop();
  },
};
