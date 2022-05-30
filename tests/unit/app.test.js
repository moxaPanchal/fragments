const request = require('supertest');

const app = require('../../src/app');

describe('App test', () => {
  test('should return a error message', async () => {
    const res = await request(app).get('/fragments');
    expect(404);
    expect(res.body.status).toEqual('error');
    expect(res.error.message).toEqual('cannot GET /fragments (404)');
  });
});
