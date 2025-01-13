// Mock mailtrap client for testing
export const mailtrapClient = {
  send: jest.fn().mockResolvedValue({ success: true }),
};

export const sender = {
  email: 'test@example.com',
  name: 'Test Sender',
};
