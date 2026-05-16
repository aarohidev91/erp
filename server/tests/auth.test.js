const request = require('supertest');

describe('Auth API', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:5000';

  test('POST /api/auth/login - should fail with invalid credentials', async () => {
    const res = await request(baseUrl)
      .post('/api/auth/login')
      .send({ username: 'nonexistent', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  test('POST /api/auth/login - should fail without required fields', async () => {
    const res = await request(baseUrl)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(400);
  });

  test('GET /api/auth/me - should fail without token', async () => {
    const res = await request(baseUrl)
      .get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/health - should return ok', async () => {
    const res = await request(baseUrl)
      .get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/permissions - should return permissions list', async () => {
    const res = await request(baseUrl)
      .get('/api/permissions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.permissions)).toBe(true);
    expect(res.body.permissions.length).toBeGreaterThan(0);
  });
});
