import nodemailer from 'nodemailer';

const requiredMailEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];

const createTransporter = () => {
  const missingEnv = requiredMailEnv.filter((key) => !process.env[key]);

  if (missingEnv.length > 0) {
    throw new Error(`Missing mail config: ${missingEnv.join(', ')}`);
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendResetPasswordEmail = async (to, code) => {
  const transporter = createTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: 'Reset Password Code',
    text: `Your reset password code is ${code}. This code will expire in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Reset Password</h2>
        <p>Use this code to reset your password:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>This code will expire in 15 minutes.</p>
      </div>
    `,
  });
};
