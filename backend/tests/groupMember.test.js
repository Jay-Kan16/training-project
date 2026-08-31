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
  app = require('../server');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Group member addition permissions', () => {
  let tokenA; // Creator
  let tokenB; // Regular Member
  let tokenD; // Non-member
  let userC;
  let groupId;

  beforeAll(async () => {
    // Create User A
    const resA = await request(app).post('/api/auth/signup').send({
      name: 'User A (Creator)',
      email: 'usera@example.com',
      password: 'password123',
    });
    tokenA = resA.body.token;

    // Create User B
    const resB = await request(app).post('/api/auth/signup').send({
      name: 'User B (Member)',
      email: 'userb@example.com',
      password: 'password123',
    });
    tokenB = resB.body.token;
    const userBId = resB.body.user.id;

    // Create User C (to be added)
    const resC = await request(app).post('/api/auth/signup').send({
      name: 'User C (Target)',
      email: 'userc@example.com',
      password: 'password123',
    });
    userC = resC.body.user;

    // Create User D (outsider)
    const resD = await request(app).post('/api/auth/signup').send({
      name: 'User D (Outsider)',
      email: 'userd@example.com',
      password: 'password123',
    });
    tokenD = resD.body.token;

    // User A creates group with User B as initial member
    const groupRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Trip Group',
        members: [userBId],
      });
    groupId = groupRes.body.group._id;
  });

  test('Regular group member (User B) can add new member (User C) to the group', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        email: 'userc@example.com',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.member.email).toBe('userc@example.com');
    expect(
      res.body.group.members.some((m) => m.email === 'userc@example.com')
    ).toBe(true);
  });

  test('Fails when trying to add a user who is already a member', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        email: 'userc@example.com',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already a member/i);
  });

  test('Non-member (User D) cannot add members to the group', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${tokenD}`)
      .send({
        email: 'userd@example.com',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/must be a member/i);
  });

  test('Fails when adding a non-existent email', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        email: 'nonexistent@example.com',
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/no registered user found/i);
  });
});

