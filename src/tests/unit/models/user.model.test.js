import { expect } from 'chai';
import User from '../../../models/user.model.js';

describe('User Model - Basic Tests', () => {
  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPass123!';
      const hash = await User.hashPassword(password);
      
      expect(hash).to.be.a('string');
      expect(hash).to.not.equal(password);
      expect(hash.length).to.be.greaterThan(50);
    });
  });

  describe('comparePassword', () => {
    it('should compare password correctly', async () => {
      const password = 'TestPass123!';
      const hash = await User.hashPassword(password);
      
      const user = new User({ passwordHash: hash });
      const isValid = await user.comparePassword(password);
      
      expect(isValid).to.be.true;
    });

    it('should return false for wrong password', async () => {
      const password = 'TestPass123!';
      const hash = await User.hashPassword(password);
      
      const user = new User({ passwordHash: hash });
      const isValid = await user.comparePassword('WrongPassword');
      
      expect(isValid).to.be.false;
    });
  });
});
