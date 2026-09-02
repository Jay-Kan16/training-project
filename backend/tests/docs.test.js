const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;

jest.setTimeout(40000);

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

describe('Swagger Documentation API', () => {
  test('serves OpenAPI 3.0 JSON specification', async () => {
    const res = await request(app).get('/api/docs.json');
    expect(res.statusCode).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toBe('Splitzy API');
    expect(res.body.paths['/api/auth/login']).toBeDefined();
    expect(res.body.paths['/api/groups']).toBeDefined();
    expect(res.body.paths['/api/expenses']).toBeDefined();
    expect(res.body.paths['/api/notifications']).toBeDefined();
  });

  test('redirects /api-docs to /api/docs', async () => {
    const res = await request(app).get('/api-docs');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/api/docs');
  });

  test('serves Swagger UI HTML page at /api/docs/', async () => {
    const res = await request(app).get('/api/docs/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Swagger UI');
  });
});

