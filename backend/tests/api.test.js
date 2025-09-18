const request = require('supertest');
const createTestApp = require('./testApp');
const userStorage = require('../data/userStorage');

describe('Software Download Manager API', () => {
  let app;
  let authToken;
  let testUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    app = createTestApp();
    // Clear user storage before each test
    userStorage.users = [];
    userStorage.currentId = 1;
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/register', () => {
      it('should register a new user successfully', async () => {
        const response = await request(app)
          .post('/api/register')
          .send(testUser)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('User registered successfully');
        expect(response.body.user.email).toBe(testUser.email);
        expect(response.body.user.fullName).toBe(testUser.fullName);
        expect(response.body.user.id).toBeDefined();
        expect(response.body.user.createdAt).toBeDefined();
      });

      it('should fail with missing required fields', async () => {
        const response = await request(app)
          .post('/api/register')
          .send({
            email: 'test@example.com'
            // Missing fullName and password
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Full name, email, and password are required');
      });

      it('should fail with invalid email format', async () => {
        const response = await request(app)
          .post('/api/register')
          .send({
            fullName: 'Test User',
            email: 'invalid-email',
            password: 'password123'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid email format');
      });

      it('should fail with short password', async () => {
        const response = await request(app)
          .post('/api/register')
          .send({
            fullName: 'Test User',
            email: 'test@example.com',
            password: '123'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Password must be at least 6 characters long');
      });

      it('should fail when user already exists', async () => {
        // Register user first time
        await request(app)
          .post('/api/register')
          .send(testUser)
          .expect(201);

        // Try to register same user again
        const response = await request(app)
          .post('/api/register')
          .send(testUser)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('User with this email already exists');
      });
    });

    describe('POST /api/login', () => {
      beforeEach(async () => {
        // Register a user before login tests
        await request(app)
          .post('/api/register')
          .send(testUser);
      });

      it('should login successfully with valid credentials', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({
            email: testUser.email,
            password: testUser.password
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.token).toBeDefined();
        expect(response.body.user.email).toBe(testUser.email);
        expect(response.body.user.fullName).toBe(testUser.fullName);

        authToken = response.body.token;
      });

      it('should fail with missing credentials', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({
            email: testUser.email
            // Missing password
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Email and password are required');
      });

      it('should fail with invalid email', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({
            email: 'nonexistent@example.com',
            password: testUser.password
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid email or password');
      });

      it('should fail with invalid password', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid email or password');
      });
    });
  });

  describe('Protected Endpoints', () => {
    beforeEach(async () => {
      // Register and login to get token
      await request(app)
        .post('/api/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = loginResponse.body.token;
    });

    describe('GET /api/profile', () => {
      it('should get user profile with valid token', async () => {
        const response = await request(app)
          .get('/api/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.user.email).toBe(testUser.email);
        expect(response.body.user.fullName).toBe(testUser.fullName);
        expect(response.body.user.id).toBeDefined();
      });

      it('should fail without token', async () => {
        const response = await request(app)
          .get('/api/profile')
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Access token is required');
      });

      it('should fail with invalid token', async () => {
        const response = await request(app)
          .get('/api/profile')
          .set('Authorization', 'Bearer invalid-token')
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid or expired token');
      });
    });
  });

  describe('Software Endpoints', () => {
    describe('GET /api/software', () => {
      it('should get software list without authentication', async () => {
        const response = await request(app)
          .get('/api/software')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        
        // Check structure of first software item
        const firstSoftware = response.body[0];
        expect(firstSoftware).toHaveProperty('id');
        expect(firstSoftware).toHaveProperty('name');
        expect(firstSoftware).toHaveProperty('description');
        expect(firstSoftware).toHaveProperty('size');
        expect(firstSoftware).toHaveProperty('category');
        expect(firstSoftware).toHaveProperty('link');
      });

      it('should return software with expected categories', async () => {
        const response = await request(app)
          .get('/api/software')
          .expect(200);

        const categories = [...new Set(response.body.map(s => s.category))];
        expect(categories).toContain('Browser');
        expect(categories).toContain('Media');
        expect(categories).toContain('Utilities');
      });
    });

    describe('POST /api/download', () => {
      beforeEach(async () => {
        // Register and login to get token
        await request(app)
          .post('/api/register')
          .send(testUser);

        const loginResponse = await request(app)
          .post('/api/login')
          .send({
            email: testUser.email,
            password: testUser.password
          });

        authToken = loginResponse.body.token;
      });

      it('should fail without authentication', async () => {
        const response = await request(app)
          .post('/api/download')
          .send({ softwareIds: [1] })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Access token is required');
      });

      it('should fail with missing software IDs', async () => {
        const response = await request(app)
          .post('/api/download')
          .set('Authorization', `Bearer ${authToken}`)
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Software IDs are required');
      });

      it('should fail with empty software IDs array', async () => {
        const response = await request(app)
          .post('/api/download')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ softwareIds: [] })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Software IDs are required');
      });

      it('should fail with invalid software ID', async () => {
        const response = await request(app)
          .post('/api/download')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ softwareIds: [999] })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Software not found');
      });

      it('should return download links for multiple software', async () => {
        const response = await request(app)
          .post('/api/download')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ softwareIds: [1, 2, 3] })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Download links generated successfully');
        expect(Array.isArray(response.body.downloadLinks)).toBe(true);
        expect(response.body.downloadLinks).toHaveLength(3);
        
        const firstLink = response.body.downloadLinks[0];
        expect(firstLink).toHaveProperty('id');
        expect(firstLink).toHaveProperty('name');
        expect(firstLink).toHaveProperty('downloadUrl');
        expect(firstLink).toHaveProperty('requestedBy', testUser.email);
        expect(firstLink).toHaveProperty('requestedAt');
      });

      // Note: Single file download test would require actual file existence
      // This test is commented out as it requires file system setup
      /*
      it('should download single software file', async () => {
        const response = await request(app)
          .post('/api/download')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ softwareIds: [1] })
          .expect(200);

        expect(response.headers['content-disposition']).toContain('attachment');
        expect(response.headers['content-type']).toBe('application/octet-stream');
      });
      */
    });
  });
});