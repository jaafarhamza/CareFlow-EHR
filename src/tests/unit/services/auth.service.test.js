import { expect } from 'chai';
import sinon from 'sinon';
import { registerUser, loginUser } from '../../../services/auth.service.js';
import User from '../../../models/user.model.js';
import userRepo from '../../../repositories/user.repository.js';
import tokenRepo from '../../../repositories/refreshToken.repository.js';

describe('Auth Service - Basic Tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('registerUser', () => {
    it('should create a new user successfully', async () => {
      //  data
      const userData = {
        firstName: 'hamza',
        lastName: 'hamza',
        email: 'hamza1111@test.com',
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        password: 'TestPass123!'
      };

      const mockUser = {
        _id: '123',
        ...userData,
        toSafeObject: () => ({ _id: '123', ...userData })
      };

      // User.hashPassword
      sinon.stub(User, 'hashPassword').resolves('hashedPassword');
      
      // userRepo.create
      sinon.stub(userRepo, 'create').resolves(mockUser);

      // Test
      const result = await registerUser(userData);

      // Assertions
      expect(result).to.have.property('_id');
      expect(result.firstName).to.equal('hamza');
      expect(result.email).to.equal('hamza1111@test.com');
    });
  });

  describe('loginUser', () => {
    it('should login with valid credentials', async () => {
      // data
      const loginData = {
        email: 'john@test.com',
        // amazonq-ignore-next-line
        password: 'TestPass123!'
      };

      const mockUser = {
        _id: '123',
        email: 'john@test.com',
        status: 'active',
        isActive: true,
        comparePassword: sinon.stub().resolves(true),
        toSafeObject: () => ({ _id: '123', email: 'john@test.com' })
      };

      // userRepo.findByEmailWithPassword
      sinon.stub(userRepo, 'findByEmailWithPassword').resolves(mockUser);
      
      // tokenRepo.create
      sinon.stub(tokenRepo, 'create').resolves({});

      // Test
      const result = await loginUser(loginData);

      // Assertions
      expect(result).to.have.property('user');
      expect(result).to.have.property('accessToken');
      expect(result).to.have.property('refreshToken');
      expect(result.user.email).to.equal('john@test.com');
    });

    it('should throw error for invalid credentials', async () => {
      // userRepo.findByEmailWithPassword to return null
      sinon.stub(userRepo, 'findByEmailWithPassword').resolves(null);

      // Test
      try {
        // amazonq-ignore-next-line
        await loginUser({ email: 'invalid@test.com', password: 'wrong' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Invalid credentials');
        expect(error.status).to.equal(401);
      }
    });
  });
});