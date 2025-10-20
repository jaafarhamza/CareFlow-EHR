# CareFlow-EHR Test Suite Documentation

This directory contains the test suite for the CareFlow-EHR application, focusing on authentication and user management functionality.

## 📁 Current Directory Structure

```
src/tests/
├── README.md                         # This documentation
├── helpers/
│   └── setupTestEnv.js               # Mocha root hooks + in-memory Mongo + Supertest bootstrap
├── integration/
│   ├── auth.integration.test.js      # Auth API: register, login, refresh, logout
│   └── user.integration.test.js      # Admin APIs: create, list, update user
└── unit/
    ├── middlewares/
    │   └── auth.middleware.test.js   # 4 tests - Auth middleware
    ├── models/
    │   └── user.model.test.js        # 3 tests - User model
    ├── services/
    │   └── auth.service.test.js      # 3 tests - Auth service
    └── utils/                        # Utility tests (empty - ready for implementation)
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm
- MongoDB (for future integration tests)

### Running Tests

```bash
# Run all tests (currently 17 tests)
npm test

# Run tests in watch mode for development
npm run test:watch
```

## 📊 Current Test Status

### ✅ IMPLEMENTED & WORKING (17 tests passing)

#### Integration Tests
- **Auth API** (`integration/auth.integration.test.js`) – 4 tests
  - ✅ `POST /api/auth/register` → 201
  - ✅ `POST /api/auth/login` → 200 (returns access token + sets refresh cookie)
  - ✅ `POST /api/auth/refresh` → 200 (returns new access token)
  - ✅ `POST /api/auth/logout` → 204 (no-content)

- **User API (admin)** (`integration/user.integration.test.js`) – 3 tests
  - ✅ `POST /api/admin/users` → 201
  - ✅ `GET /api/admin/users` → 200 (returns list)
  - ✅ `PATCH /api/admin/users/:id` → 200 (updates user)

#### Unit Tests
- **Auth Service** (`unit/services/auth.service.test.js`) – 3 tests
- **User Model** (`unit/models/user.model.test.js`) – 3 tests
- **Auth Middleware** (`unit/middlewares/auth.middleware.test.js`) – 4 tests

### What's Currently Tested
- ✅ Registration, login, refresh, and logout flows
- ✅ Admin-only endpoints: create/list/update users
- ✅ Password hashing and comparison
- ✅ Token validation middleware and role-based access control

### What's Missing / Next Candidates / Future Implementation Roadmap
- ❌ Negative integration paths (duplicate registration, invalid login, invalid/expired refresh token)
- ❌ Refresh-token rotation/revocation scenarios
- ❌ Password reset flow (request/verify/complete)
- ❌ Delete/deactivate user admin endpoints
- ❌ Utility functions tests (`unit/utils/`)

## 🧪 Test Framework Stack

| Tool | Version | Purpose | Status |
|------|---------|---------|--------|
| **Mocha** | ^11.7.4 | Test framework and runner | ✅ Used |
| **Chai** | ^6.2.0 | Assertion library | ✅ Used |
| **Sinon** | ^21.0.0 | Mocking and stubbing | ✅ Used (unit) |
| **Supertest** | ^7.1.4 | HTTP endpoint testing | ✅ Used (integration) |
| **mongodb-memory-server** | ^10.2.3 | In-memory database for testing | ✅ Used (integration) |

## 🛠️ Test Scripts Configuration

From your `package.json`:

```json
{
  "scripts": {
    "test": "mocha --require src/tests/helpers/setupTestEnv.js \"src/tests/**/*.test.js\" --recursive --timeout 60000",
    "test:watch": "mocha --require src/tests/helpers/setupTestEnv.js \"src/tests/**/*.test.js\" --recursive --watch"
  }
}
```

### Available Commands

| Command | Description | Status | Test Count |
|---------|-------------|--------|------------|
| `npm test` | Run all tests with 5s timeout | ✅ Working | 10 tests |
| `npm run test:watch` | Run tests in watch mode | ✅ Working | 10 tests |

## 📝 Current Test Implementation Examples

### Auth Service Test Structure
```javascript
import { expect } from 'chai';
import sinon from 'sinon';
import { registerUser, loginUser } from '../../../services/auth.service.js';
import User from '../../../models/user.model.js';
import userRepo from '../../../repositories/user.repository.js';
import tokenRepo from '../../../repositories/refreshToken.repository.js';

describe('Auth Service - Basic Tests', () => {
  afterEach(() => {
    sinon.restore(); // Clean up mocks
  });

  describe('registerUser', () => {
    it('should create a new user successfully', async () => {
      // Mock data
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'TestPass123!'
      };

      const mockUser = {
        _id: '123',
        ...userData,
        toSafeObject: () => ({ _id: '123', ...userData })
      };

      // Mock dependencies
      sinon.stub(User, 'hashPassword').resolves('hashedPassword');
      sinon.stub(userRepo, 'create').resolves(mockUser);

      // Test
      const result = await registerUser(userData);

      // Assertions
      expect(result).to.have.property('_id');
      expect(result.firstName).to.equal('John');
      expect(result.email).to.equal('john@test.com');
    });
  });
});
```

### User Model Test Structure
```javascript
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
});
```

### Auth Middleware Test Structure
```javascript
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
  });
});
```

## 🔧 Current Mocking Strategy

### Repository Mocking (Your Pattern)
```javascript
// Mock user repository operations
sinon.stub(userRepo, 'create').resolves(mockUser);
sinon.stub(userRepo, 'findByEmailWithPassword').resolves(mockUser);
sinon.stub(tokenRepo, 'create').resolves({});
```

### Model Mocking (Your Pattern)
```javascript
// Mock User model methods
sinon.stub(User, 'hashPassword').resolves('hashedPassword');
```

### Mock User Objects (Your Pattern)
```javascript
// Your current mock user structure
const mockUser = {
  _id: '123',
  email: 'hamza@test.com',
  status: 'active',
  isActive: true,
  comparePassword: sinon.stub().resolves(true),
  toSafeObject: () => ({ _id: '123', email: 'hamza@test.com' })
};
```

### Response Mocking (Your Pattern)
```javascript
// Your middleware test pattern
const res = { 
  status: sinon.stub().returnsThis(), 
  json: sinon.stub() 
};
const next = sinon.stub();
```

## 🎯 Test Coverage Analysis

### Current Coverage Snapshot (by test count)

| Component | Tests | Status |
|-----------|-------|--------|
| **Auth Service (unit)** | 3 | ✅ Implemented |
| **User Model (unit)** | 3 | ✅ Implemented |
| **Auth Middleware (unit)** | 4 | ✅ Implemented |
| **Auth API (integration)** | 4 | ✅ Implemented |
| **User API (integration)** | 3 | ✅ Implemented |

### What's Currently Tested
- ✅ User registration with password hashing
- ✅ User login with JWT token generation
- ✅ Error handling for invalid credentials
- ✅ Password hashing and comparison
- ✅ Token validation middleware
- ✅ Role-based access control

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. "No test files found" Error
**Problem**: Mocha can't find test files
**Solution**: 
- Ensure files end with `.test.js`
- Check directory structure
- Use double quotes in Windows: `"src/tests/**/*.test.js"`

#### 2. ES Module Stubbing Issues
**Problem**: `TypeError: ES Modules cannot be stubbed`
**Solution**: Use direct assignment instead of Sinon stubs for ES modules

#### 3. Database Connection Issues
**Problem**: Buffering timeouts or duplicate key errors
**Solution**:
- Tests use `mongodb-memory-server` and connect via `setupTestEnv.js` root hooks.
- The setup drops the DB before the run to avoid duplicates.
- If you run a single test file in isolation, prefer unique emails (e.g., `user_${Date.now()}@test.com`).

#### 4. Timeout Issues
**Problem**: Tests timeout
**Solution**: 
- Increase timeout in scripts (you have 5s timeout)
- Mock slow operations
- Use `--timeout 5000` flag

### Debug Commands

```bash
# Run specific test file
npm test -- --grep "Auth Service"

# Run with debug output
DEBUG=* npm test

# Run single test
npm test -- --grep "should create a new user successfully"
```

## 📚 Best Practices

### 1. Test Organization ✅
- One test file per component
- Group related tests with `describe` blocks
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

### 2. Mocking Guidelines ✅
- Mock external dependencies (databases, APIs, services)
- Don't mock the code under test
- Clean up mocks after each test (`sinon.restore()`)
- Use realistic mock data

### 3. Assertion Best Practices ✅
- Use specific assertions
- Test both success and failure cases
- Verify error messages and status codes
- Check side effects

### 4. Test Data ✅
- Use consistent test data
- Create realistic mock objects
- Clean up test data after tests
- Use meaningful test values

## 🔗 Additional Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Sinon.js Mocking](https://sinonjs.org/)
- [Supertest HTTP Testing](https://github.com/visionmedia/supertest)
- [Main Project README](../../README.md)

---

## 📊 Summary

**Current Status**: **Solid Foundation with Integration**
- ✅ Working: 17 tests passing (unit + integration)
- ✅ Infrastructure: In-memory Mongo + Mocha root hooks + Supertest
- ✅ Quality: Realistic flows and mocking where appropriate

*For questions or issues with the test suite, see `src/tests/helpers/setupTestEnv.js` and project docs.*
