import logger from '../logs/logger';
import {
  passwordResetRequestTemplate,
  passwordResetSuccessTemplate,
  verificationEmailTemplate,
} from './email-template';
import { mailtrapClient, sender } from './mailtrap';

// Define recipient type
interface Recipient {
  email: string;
}

// Function to send a verification email
export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  const recipient: Recipient[] = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Verify your email',
      html: verificationEmailTemplate.replace('{verificationCode}', verificationToken),
      category: 'Email Verification',
    });

    logger.info('Email sent successfully', response);
  } catch (error) {
    logger.error('Error sending verification email', error);
    throw new Error(`Error sending verification email: ${(error as Error).message}`);
  }
};

// Function to send a welcome email
export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const recipient: Recipient[] = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: process.env.MAILTRAP_TEMPLATE_UUID as string,
      template_variables: {
        company_info_name: 'Pocket Book',
        name,
      },
    });

    logger.info('Welcome email sent successfully', response);
  } catch (error) {
    logger.error('Error sending welcome email', error);
    throw new Error(`Error sending welcome email: ${(error as Error).message}`);
  }
};

// Function to send a password reset email
export const sendPasswordResetEmail = async (email: string, resetURL: string): Promise<void> => {
  const recipient: Recipient[] = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Reset your password',
      html: passwordResetRequestTemplate.replace('{resetURL}', resetURL),
      category: 'Password Reset',
    });

    logger.info('Password reset email sent successfully', response);
  } catch (error) {
    logger.error('Error sending password reset email', error);
    throw new Error(`Error sending password reset email: ${(error as Error).message}`);
  }
};

// Function to send a password reset success email
export const sendResetSuccessEmail = async (email: string): Promise<void> => {
  const recipient: Recipient[] = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Password Reset Successful',
      html: passwordResetSuccessTemplate,
      category: 'Password Reset',
    });

    logger.info('Password reset success email sent successfully', response);
  } catch (error) {
    logger.error('Error sending password reset success email', error);
    throw new Error(`Error sending password reset success email: ${(error as Error).message}`);
  }
};
