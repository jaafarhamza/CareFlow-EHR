import { expect } from 'chai';
import { request } from '../helpers/setupTestEnv.js';

let adminToken;

before(async () => {
  // register admin
  await request.post('/api/auth/register').send({
    firstName: 'Admin', lastName: 'User', email: 'admin@test.com', password: 'AdminPass123!'
  });
  // Manually promote to admin
  const User = (await import('../../models/user.model.js')).default;
  await User.updateOne({ email: 'admin@test.com' }, { role: 'admin' });
  const loginRes = await request.post('/api/auth/login').send({ email: 'admin@test.com', password: 'AdminPass123!' });
  adminToken = loginRes.body.data.accessToken;
});

describe('User API (admin)', () => {
  let createdId;
  it('POST /api/admin/users should create user', async () => {
    const res = await request.post('/api/admin/users').set('Authorization', `Bearer ${adminToken}`).send({
      // amazonq-ignore-next-line
      firstName: 'Bob', lastName: 'Patient', email: 'bob@test.com', password: 'TestPass123!'
    });
    expect(res.status).to.equal(201);
    createdId = res.body.data._id;
  });

  it('GET /api/admin/users should list users', async () => {
    const res = await request.get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.items.length).to.be.greaterThan(0);
  });

  it('PATCH /api/admin/users/:id should update user', async () => {
    const res = await request.patch(`/api/admin/users/${createdId}`).set('Authorization', `Bearer ${adminToken}`).send({ firstName: 'Bobby' });
    expect(res.status).to.equal(200);
    expect(res.body.data.firstName).to.equal('Bobby');
  });
});
