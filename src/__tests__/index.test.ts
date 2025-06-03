import request from 'supertest';
import app from '../index';

describe('App', () => {
  describe('POST - /signup', () => {
    it('should create a new user', async () => {
      const response = await request(app).post('/signup');

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Hello World!' });
    });
  });
});
