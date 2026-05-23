import nodemailer from 'nodemailer';
import env from '../configs/env.js';
import logger from '../utils/logger.js';

let transporter = null;

const isSmtpConfigured = () => Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const getTransporter = () => {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const getEmailHealth = () => ({
  configured: isSmtpConfigured(),
  host: env.SMTP_HOST || null,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  from: env.EMAIL_FROM,
});

export const sendEmail = async ({ to, subject, text, html }) => {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  const mailer = getTransporter();

  if (!recipients.length) {
    return {
      status: 'skipped',
      reason: 'No email recipients matched the notification audience.',
      accepted: [],
      rejected: [],
    };
  }

  if (!mailer) {
    return {
      status: 'skipped',
      reason: 'SMTP is not configured.',
      accepted: [],
      rejected: recipients,
    };
  }

  try {
    const result = await mailer.sendMail({
      from: env.EMAIL_FROM,
      to: recipients,
      subject,
      text,
      html,
    });

    return {
      status: 'sent',
      messageId: result.messageId,
      accepted: result.accepted || [],
      rejected: result.rejected || [],
    };
  } catch (error) {
    logger.warn(`[Email] Failed to send notification email: ${error.message}`);
    return {
      status: 'failed',
      reason: error.message,
      accepted: [],
      rejected: recipients,
    };
  }
};

export default { getEmailHealth, sendEmail };

