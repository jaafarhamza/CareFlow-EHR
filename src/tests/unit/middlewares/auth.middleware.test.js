import { expect } from 'chai';
import sinon from 'sinon';
import { requireAuth, requireRoles } from '../../../middlewares/auth.middleware.js';

describe('Auth Middleware - Basic Tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('requireAuth', () => {
    it('should reject access without token', () => {
      const req = { headers: {} };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      const next = sinon.stub();

      requireAuth(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should reject access with invalid token format', () => {
      const req = { headers: { authorization: 'InvalidFormat' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      const next = sinon.stub();

      requireAuth(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(next.called).to.be.false;
    });
  });

  describe('requireRoles', () => {
    it('should allow access for admin role', () => {
      const req = { user: { role: 'admin' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      const next = sinon.stub();

      const middleware = requireRoles('admin');
      middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
    });

    it('should reject access for wrong role', () => {
      const req = { user: { role: 'patient' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      const next = sinon.stub();

      const middleware = requireRoles('admin');
      middleware(req, res, next);

      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(next.called).to.be.false;
    });
  });
});