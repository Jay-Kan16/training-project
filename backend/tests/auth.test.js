const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test_secret';
  process.env.NODE_ENV = 'test';
  await mongoose.connect(process.env.MONGO_URI);
  app = require('../server'); // eslint-disable-line global-require
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('POST /api/auth/signup + login', () => {
  test('signs up a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('rejects duplicate email signup', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Another User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(400);
  });

  test('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/auth/google', () => {
  const { OAuth2Client } = require('google-auth-library');

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('authenticates and creates a new user with valid Google credential', async () => {
    jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => ({
        sub: 'google-12345',
        email: 'googleuser@example.com',
        name: 'Google User',
        picture: 'https://example.com/avatar.jpg',
      }),
    });

    const res = await request(app).post('/api/auth/google').send({
      credential: 'fake-valid-google-token',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('googleuser@example.com');
    expect(res.body.user.name).toBe('Google User');
    expect(res.body.user.avatar).toBe('https://example.com/avatar.jpg');
  });

  test('logs in existing user and links Google ID and avatar', async () => {
    jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => ({
        sub: 'google-99999',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/new-pic.jpg',
      }),
    });

    const res = await request(app).post('/api/auth/google').send({
      credential: 'fake-valid-google-token-2',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('test@example.com');
  });

  test('rejects invalid Google token', async () => {
    jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockRejectedValueOnce(
      new Error('Invalid token signature')
    );

    const res = await request(app).post('/api/auth/google').send({
      credential: 'invalid-token',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Google token verification failed/i);
  });

  test('rejects request without credential', async () => {
    const res = await request(app).post('/api/auth/google').send({});
    expect(res.statusCode).toBe(400);
  });
});
