import { MailtrapClient } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN as string;

if (!TOKEN) {
  console.error('Mailtrap token is missing in environment variables');
  // process.exit(1); // Exit the process with a failure code
}

// Initialize Mailtrap client
export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: 'mailtrap@demomailtrap.com',
  name: 'PocketBook',
};

// const recipients = [
//   {
//     email: 'anumahjoshuaeneye@gmail.com',
//   },
// ];

// Function to send an email
// const sendMail = async () => {
//   try {
//     const response = await client.send({
//       from: sender,
//       to: recipients,
//       subject: 'You are awesome!',
//       text: 'Congrats for sending test email with Mailtrap!',
//       category: 'Integration Test',
//     });

//     logger.info(`Email sent successfully: ${JSON.stringify(response)}`);
//   } catch (error) {
//     logger.error(`Failed to send email: ${(error as Error).message}`);
//     throw new Error('Email sending failed');
//   }
// };

// Call the function to send the email
// sendMail();
