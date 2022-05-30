const request = require('supertest');

const app = require('../../src/app');

describe('App test', () => {
  test('should return HTTP 404 response', async () => {
    const res = await request(app).get('/home');
    expect(404);
  });

  test('should return status: error in response', async () => {
    const res = await request(app).get('/fragments');
    expect(res.body.status).toEqual('error');
  });

  test('should return a error message', async () => {
    const res = await request(app).get('/fragments');
    expect(res.error.message).toEqual('cannot GET /fragments (404)');
  });
});
