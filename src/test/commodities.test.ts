import logger from '../logs/logger';
import HTTP_STATUS from '../utils/http-status';
import TestFactory from './factory';

const url = '/api/v1/commodities';
const description = 'Sweet honey beans';

describe('POST /commodities', () => {
  const factory = new TestFactory();
  let authToken: string;

  beforeEach(async () => {
    await factory.init();
    
    // Create a test user
    const signUpResponse = await factory.app
      .post('/api/v1/sign-up')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        confirmPassword: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
      });

    // console.log('Sign-up Response:', {
    //   status: signUpResponse.status,
    //   body: signUpResponse.body,
    //   headers: signUpResponse.headers,
    //   error: signUpResponse.error
    // });

    // If sign-up failed, throw error with details
    if (signUpResponse.status !== 201) {
      throw new Error(`Sign-up failed: ${JSON.stringify(signUpResponse.body)}`);
    }

    // Sign in to get the auth token
    const signInResponse = await factory.app
      .post('/api/v1/sign-in')
      .send({
        email: 'test@example.com',
        password: 'Test123!'
      });

    // logger.info('Sign-in Response:', {
    //   status: signInResponse.status,
    //   ok: signInResponse.ok,
    //   body: signInResponse.body,
    //   headers: Object.keys(signInResponse.headers).map(key => [key, signInResponse.headers[key]])
    // });

    // If sign-in failed, throw error with details
    if (signInResponse.status !== 200) {
      throw new Error(`Sign-in failed: ${JSON.stringify(signInResponse.body)}`);
    }

    // Get the token from cookies
    const cookiesHeader = signInResponse.headers['set-cookie'];
    // console.log('Cookies Header:', cookiesHeader);
    
    if (!cookiesHeader || !Array.isArray(cookiesHeader)) {
      throw new Error('No cookies returned from sign-in');
    }

    // Find the token cookie
    const tokenCookie = cookiesHeader.find(cookie => cookie.startsWith('token='));
    // logger.info('Token Cookie:', tokenCookie);

    if (!tokenCookie) {
      throw new Error('Token cookie not found');
    }

    // Extract token value (now handling non-signed cookies)
    authToken = tokenCookie.split(';')[0].split('=')[1];
    logger.info('Extracted Token:', authToken);

    if (!authToken) {
      throw new Error('Failed to extract token from cookie');
    }

    // Add a small delay to ensure MongoDB is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterEach(async () => {
    await factory.close();
  });

  it('It creates a commodity successfully', async () => {
    const response = await factory.app
      .post(url)
      .set('Cookie', `token=${authToken}`)
      .send({
        commodityName: 'Beans',
        description,
        unit: 'ton',
        quantity: 14,
        color: '#036410',
        price: 34.99,
      });

    console.log(response.body);

    // Check that the response status is 201 (Created)
    expect(response.status).toBe(HTTP_STATUS.CREATED);
    expect(response.body.message).toBe('Commodity added successfully!');

    // Check that the response contains the created commodity data
    expect(response.body.data).toHaveProperty('commodityName', 'Beans');
    expect(response.body.data).toHaveProperty('description', description);
    expect(response.body.data).toHaveProperty('unit', 'ton');
    expect(response.body.data).toHaveProperty('quantity', 14);
    expect(response.body.data).toHaveProperty('color', '#036410');
    expect(response.body.data).toHaveProperty('prices'); // Check if prices array is present
  });

  it('should return an error if the commodity name already exists', async () => {
    // First create the commodity
    await factory.app
      .post(url)
      .set('Cookie', `token=${authToken}`)
      .send({
        commodityName: 'Beans',
        description,
        unit: 'ton',
        quantity: 14,
        color: '#036410',
        price: 34.99,
      });

    // Now try to create the same commodity again
    const response = await factory.app
      .post(url)
      .set('Cookie', `token=${authToken}`)
      .send({
        commodityName: 'Beans',
        description: 'Different description',
        unit: 'kg',
        quantity: 10,
        color: '#FF5733',
        price: 29.99,
      });

    // Check that it returns a conflict status
    expect(response.status).toBe(HTTP_STATUS.CONFLICT);
    expect(response.body.message).toBe('Commodity with this name already exists'); // Based on your error handling
  });

  it('should return an error if the color already exists for a different commodity', async () => {
    await factory.app
      .post(url)
      .set('Cookie', `token=${authToken}`)
      .send({
        commodityName: 'Rice',
        description: 'White rice',
        unit: 'kg',
        quantity: 20,
        color: '#036410', // Same color as the next commodity
        price: 30,
      });

    const response = await factory.app
      .post(url)
      .set('Cookie', `token=${authToken}`)
      .send({
        commodityName: 'Beans',
        description,
        unit: 'ton',
        quantity: 14,
        color: '#036410', // Attempting to use the same color
        price: 34.99,
      });

    expect(response.status).toBe(HTTP_STATUS.CONFLICT);
    expect(response.body.message).toBe('Color already exists');
  });

  it('should return an error if required fields are missing', async () => {
    const response = await factory.app
      .post(url)
      .set('Cookie', `token=${authToken}`)
      .send({
        description: 'Missing commodity name',
        unit: 'ton',
        quantity: 14,
        color: '#036410',
        price: 34.99,
      });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.commodityName).toBe('Commodity name is required');
  });

  it('should return an error if quantity is negative', async () => {
    const response = await factory.app
      .post(url)
      .set('Cookie', `token=${authToken}`)
      .send({
        commodityName: 'Test Commodity',
        description,
        unit: 'kg',
        quantity: -10,
        color: '#FF5733',
        price: 29.99,
      });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.quantity).toBe('Quantity must be greater than or equal to 0');
  });

  it('should return an error if price is negative', async () => {
    const response = await factory.app
      .post(url)
      .set('Cookie', `token=${authToken}`)
      .send({
        commodityName: 'Test Commodity',
        description,
        unit: 'kg',
        quantity: 10,
        color: '#FF5733',
        price: -29.99,
      });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.price).toBe('Price must be greater than 0');
  });

  it('should return an error if the commodity name exceeds character limit', async () => {
    const response = await factory.app
      .post(url)
      .set('Cookie', `token=${authToken}`)
      .send({
        commodityName: 'A'.repeat(51), // Exceeds 50 character limit
        description,
        unit: 'kg',
        quantity: 10,
        color: '#FF5733',
        price: 29.99,
      });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.commodityName).toBe('Commodity name must be less than or equal to 50 characters long');
  });

  it('should return an error if the color format is invalid', async () => {
    const response = await factory.app
      .post(url)
      .set('Cookie', `token=${authToken}`)
      .send({
        commodityName: 'Test Commodity',
        description,
        unit: 'kg',
        quantity: 10,
        color: 'invalid',
        price: 29.99,
      });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.color).toBe('Color must be a valid hex color (e.g. #FF5733)');
  });
});
