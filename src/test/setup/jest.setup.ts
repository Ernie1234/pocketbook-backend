// Mock mailtrap
jest.mock('../../mails/mailtrap', () => ({
  mailtrapClient: {
    send: jest.fn().mockResolvedValue({ success: true }),
  },
  sender: {
    email: 'test@example.com',
    name: 'Test Sender',
  },
}));
