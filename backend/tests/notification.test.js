const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;
let user1Token;
let user2Token;
let user1Id;
let user2Id;
let groupId;

jest.setTimeout(40000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test_secret';
  process.env.NODE_ENV = 'test';
  await mongoose.connect(process.env.MONGO_URI);
  app = require('../server'); // eslint-disable-line global-require

  // Create User 1
  const u1 = await request(app).post('/api/auth/signup').send({
    name: 'Alice',
    email: 'alice@example.com',
    password: 'password123',
  });
  user1Token = u1.body.token;
  user1Id = u1.body.user.id;

  // Create User 2
  const u2 = await request(app).post('/api/auth/signup').send({
    name: 'Bob',
    email: 'bob@example.com',
    password: 'password123',
  });
  user2Token = u2.body.token;
  user2Id = u2.body.user.id;

  // Create a Group
  const g = await request(app)
    .post('/api/groups')
    .set('Authorization', `Bearer ${user1Token}`)
    .send({
      name: 'Trip Group',
      members: [user2Id],
    });
  groupId = g.body.group._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Notifications API', () => {
  let notificationId;

  test('sends a settlement reminder from Alice to Bob', async () => {
    const res = await request(app)
      .post('/api/notifications/remind')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        recipientId: user2Id,
        groupId,
        amount: 250,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.notification).toBeDefined();
    expect(res.body.notification.recipient.toString()).toBe(user2Id.toString());
    expect(res.body.notification.message).toContain('Alice sent you a reminder to settle ₹250 in Trip Group');
    notificationId = res.body.notification._id;
  });

  test('Bob fetches his notifications and sees the unread reminder', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.unreadCount).toBe(1);
    expect(res.body.notifications[0]._id.toString()).toBe(notificationId.toString());
    expect(res.body.notifications[0].read).toBe(false);
  });

  test('Bob marks the notification as read', async () => {
    const res = await request(app)
      .put(`/api/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notification.read).toBe(true);

    const getRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${user2Token}`);
    expect(getRes.body.unreadCount).toBe(0);
  });

  test('Bob deletes the notification', async () => {
    const res = await request(app)
      .delete(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${user2Token}`);
    expect(getRes.body.count).toBe(0);
  });

  test('rejects reminder sent to self', async () => {
    const res = await request(app)
      .post('/api/notifications/remind')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        recipientId: user1Id,
        groupId,
        amount: 100,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cannot send a reminder to yourself/i);
  });
});

