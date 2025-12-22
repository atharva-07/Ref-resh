import { createTransport } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

import logger from "./winston";

export const transport = createTransport({
  host: process.env.SMTP_SERVER_URI,
  secure: true,
  port: process.env.SMTP_SERVER_PORT,
  auth: {
    user: process.env.MAIL_SERVICE_LOGIN,
    pass: process.env.MAIL_SERVICE_PASSWORD,
  },
} as SMTPTransport.Options);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transport.sendMail({
      from: process.env.REFRESH_MAIL_ADDRESS,
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.error("Error sending email:", error);
    throw new Error("Could not send email.");
  }
};
