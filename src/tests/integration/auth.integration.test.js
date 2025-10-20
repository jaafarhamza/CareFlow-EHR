import { expect } from 'chai';
import { request } from '../helpers/setupTestEnv.js';

const email = `user_${Date.now()}@test.com`;

describe('Auth API', () => {
  let accessToken;
  let refreshCookie;

  it('POST /api/auth/register should create user', async () => {
    const res = await request.post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'Tester',
      email: email,
      password: 'TestPass123!'
    });
    expect(res.status).to.equal(201);
  });

  it('POST /api/auth/login should authenticate user', async () => {
    const res = await request.post('/api/auth/login').send({
      email: email,
      password: 'TestPass123!'
    });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('data');
    accessToken = res.body.data.accessToken;
    refreshCookie = res.headers['set-cookie'].find(c => c.startsWith('refreshToken'));
    expect(accessToken).to.be.a('string');
    expect(refreshCookie).to.exist;
  });

  it('POST /api/auth/refresh should refresh token', async () => {
    const res = await request.post('/api/auth/refresh').set('Cookie', refreshCookie);
    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.property('accessToken');
  });

  it('POST /api/auth/logout should logout user', async () => {
    const res = await request.post('/api/auth/logout').set('Cookie', refreshCookie);
    expect(res.status).to.equal(204);
  });
});
