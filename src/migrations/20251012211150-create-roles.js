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
    await db.createCollection('roles', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'createdAt'],
          properties: {
            name: { bsonType: 'string' },
            permissions: {
              bsonType: 'array',
              items: { bsonType: 'string' },
            },
            description: { bsonType: ['string', 'null'] },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: ['date', 'null'] },
          },
        },
      },
    });
    await db.collection('roles').createIndex(
      { name: 1 },
      { unique: true, collation: { locale: 'en', strength: 2 }, name: 'uniq_role_name_ci' }
    );
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
    await db.collection('roles').drop();
  }
};
