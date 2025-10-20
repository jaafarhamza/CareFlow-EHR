// Global test setup for integration tests
import mongoose from 'mongoose';
import env from '../../config/env.js';
import supertest from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
export let app;
export let request;
export let mongoSrv;

export const mochaHooks = {
  beforeAll: async function () {
    this.timeout(30000);
    mongoSrv = await MongoMemoryServer.create({
      auth: {
        username: 'root',
        password: 'password'
      }
    });

    const uri = mongoSrv.getUri();
    const hostPort = uri.split('@').pop();
    env.MONGO_HOST = hostPort.split(':')[0];
    env.MONGO_PORT = hostPort.split(':')[1].split('/')[0];
    env.MONGO_DB = (hostPort.split('/')[1] || 'testdb').replace('?authSource=admin', '');

    const { default: connectDB } = await import('../../config/database.js');
    await connectDB();
    await mongoose.connection.db.dropDatabase();
    const { default: appInstance } = await import('../../app.js');
    app = appInstance;
    request = supertest(app);
  },

  afterAll: async function () {
    await mongoose.disconnect();
    if (mongoSrv) await mongoSrv.stop();
    if (request && request.app && request.app.close) request.app.close();
  }
};
