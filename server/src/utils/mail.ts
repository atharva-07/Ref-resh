import { createTransport } from "nodemailer";

export const transport = createTransport({
  host: "",
  secure: true,
  port: 465,
  auth: {
    user: "",
    pass: "",
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transport.sendMail({
      from: "",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email.");
  }
};
