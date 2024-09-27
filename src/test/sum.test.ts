import { describe, expect, test } from '@jest/globals';
import request from 'supertest';

import { sum } from './sum';
import app from '..';

let server: any;

beforeAll(async () => {
  server = app.listen(8000);
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve)); // Close the server
});

describe('sum module', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
});

describe('GET /', () => {
  it('should return Welcome message!', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Welcome to Express & TypeScript Server');
  });
});
