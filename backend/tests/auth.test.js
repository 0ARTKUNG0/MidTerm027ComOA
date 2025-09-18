const authUtils = require('../utils/auth');
const userStorage = require('../data/userStorage');

describe('Auth Utils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(authUtils.isValidEmail('test@example.com')).toBe(true);
      expect(authUtils.isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(authUtils.isValidEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(authUtils.isValidEmail('invalid-email')).toBe(false);
      expect(authUtils.isValidEmail('test@')).toBe(false);
      expect(authUtils.isValidEmail('@example.com')).toBe(false);
      expect(authUtils.isValidEmail('test..test@example.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate passwords with 6 or more characters', () => {
      expect(authUtils.isValidPassword('password123')).toBe(true);
      expect(authUtils.isValidPassword('123456')).toBe(true);
      expect(authUtils.isValidPassword('verylongpassword')).toBe(true);
    });

    it('should reject passwords with less than 6 characters', () => {
      expect(authUtils.isValidPassword('12345')).toBe(false);
      expect(authUtils.isValidPassword('pass')).toBe(false);
      expect(authUtils.isValidPassword('')).toBe(false);
    });
  });

  describe('hashPassword and comparePassword', () => {
    it('should hash password and verify correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await authUtils.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);

      const isValid = await authUtils.comparePassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await authUtils.hashPassword(password);
      
      const isValid = await authUtils.comparePassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('generateToken and authenticateToken', () => {
    it('should generate and verify JWT token', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = authUtils.generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should authenticate valid token in middleware', (done) => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = authUtils.generateToken(payload);
      
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      authUtils.authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(payload.id);
      expect(req.user.email).toBe(payload.email);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      done();
    });

    it('should reject request without token', (done) => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      authUtils.authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token is required'
      });
      expect(next).not.toHaveBeenCalled();
      done();
    });

    it('should reject request with invalid token', (done) => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      authUtils.authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
      done();
    });
  });
});

describe('User Storage', () => {
  beforeEach(() => {
    // Clear user storage before each test
    userStorage.users = [];
    userStorage.currentId = 1;
  });

  describe('create', () => {
    it('should create a new user', () => {
      const userData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword'
      };

      const user = userStorage.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBe(1);
      expect(user.fullName).toBe(userData.fullName);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user.createdAt).toBeDefined();
      expect(new Date(user.createdAt)).toBeInstanceOf(Date);
    });

    it('should increment ID for multiple users', () => {
      const user1 = userStorage.create({
        fullName: 'User 1',
        email: 'user1@example.com',
        password: 'password1'
      });

      const user2 = userStorage.create({
        fullName: 'User 2',
        email: 'user2@example.com',
        password: 'password2'
      });

      expect(user1.id).toBe(1);
      expect(user2.id).toBe(2);
    });
  });

  describe('findByEmail', () => {
    beforeEach(() => {
      userStorage.create({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword'
      });
    });

    it('should find user by email', () => {
      const user = userStorage.findByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should return null for non-existent email', () => {
      const user = userStorage.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    let userId;

    beforeEach(() => {
      const user = userStorage.create({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword'
      });
      userId = user.id;
    });

    it('should find user by ID', () => {
      const user = userStorage.findById(userId);
      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
    });

    it('should return null for non-existent ID', () => {
      const user = userStorage.findById(999);
      expect(user).toBeNull();
    });
  });

  describe('emailExists', () => {
    beforeEach(() => {
      userStorage.create({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword'
      });
    });

    it('should return true for existing email', () => {
      expect(userStorage.emailExists('test@example.com')).toBe(true);
    });

    it('should return false for non-existent email', () => {
      expect(userStorage.emailExists('nonexistent@example.com')).toBe(false);
    });
  });
});