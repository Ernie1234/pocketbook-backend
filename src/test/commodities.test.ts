import HTTP_STATUS from '../utils/http-status';
import TestFactory from './factory';

const url = '/api/1v/commodities';
const description = 'Sweet honey beans';

describe('POST /commodities', () => {
  const factory = new TestFactory();

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
  });

  it('It creates a short URL successfully', async () => {
    const response = await factory.app.post(url).send({
      commodityName: 'Beans',
      description,
      unit: 'ton',
      quantity: 14,
      color: '#036410',
      price: 34.99,
    });

    console.log(response);

    // Check that the response status is 201 (Created)
    expect(response.status).toBe(HTTP_STATUS.CREATED); // or HTTP_STATUS.CREATED if that's what you use
    expect(response.body.message).toBe('Commodity added successfully!');

    // Check that the response contains the created commodity data
    expect(response.body.data).toHaveProperty('commodityName', 'Beans');
    expect(response.body.data).toHaveProperty('description', 'Sweet honey beans');
    expect(response.body.data).toHaveProperty('unit', 'ton');
    expect(response.body.data).toHaveProperty('quantity', 14);
    expect(response.body.data).toHaveProperty('color', '#036410');
    expect(response.body.data).toHaveProperty('prices'); // Check if prices array is present
  });

  it('should return an error if the commodity name already exists', async () => {
    // First create the commodity
    await factory.app.post(url).send({
      commodityName: 'Beans',
      description,
      unit: 'ton',
      quantity: 14,
      color: '#036410',
      price: 34.99,
    });

    // Now try to create the same commodity again
    const response = await factory.app.post(url).send({
      commodityName: 'Beans',
      description: 'Different description',
      unit: 'kg',
      quantity: 10,
      color: '#FF5733',
      price: 29.99,
    });

    // Check that it returns a conflict status
    expect(response.status).toBe(HTTP_STATUS.CONFLICT);
    expect(response.body.message).toBe('Commodity already exists'); // Based on your error handling
  });

  it('should return an error if the color already exists for a different commodity', async () => {
    await factory.app.post(url).send({
      commodityName: 'Rice',
      description: 'White rice',
      unit: 'kg',
      quantity: 20,
      color: '#036410', // Same color as the next commodity
      price: 30,
    });

    const response = await factory.app.post(url).send({
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
    const response = await factory.app.post(url).send({
      description: 'Missing commodity name',
      unit: 'ton',
      quantity: 14,
      color: '#036410',
      price: 34.99,
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe('Commodity name is required'); // Update as per your validation message
  });

  it('should return an error if quantity is negative', async () => {
    const response = await factory.app.post(url).send({
      commodityName: 'Beans',
      description,
      unit: 'ton',
      quantity: -5, // Invalid quantity
      color: '#036410',
      price: 34.99,
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe('Quantity must be a positive number'); // Update as per your validation message
  });

  it('should return an error if price is negative', async () => {
    const response = await factory.app.post(url).send({
      commodityName: 'Beans',
      description,
      unit: 'ton',
      quantity: 14,
      color: '#036410',
      price: -10, // Invalid price
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe('Price must be a positive number'); // Update as per your validation message
  });

  it('should return an error if the commodity name exceeds character limit', async () => {
    const longName = 'A'.repeat(256); // Assuming the limit is 255 characters
    const response = await factory.app.post(url).send({
      commodityName: longName, // Exceeding length
      description,
      unit: 'ton',
      quantity: 14,
      color: '#036410',
      price: 34.99,
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe('Commodity name is too long'); // Update as per your validation message
  });

  it('should return an error if the color format is invalid', async () => {
    const response = await factory.app.post(url).send({
      commodityName: 'Beans',
      description,
      unit: 'ton',
      quantity: 14,
      color: 'invalid-color-format', // Invalid color
      price: 34.99,
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe('Invalid color format'); // Update as per your validation message
  });
});
