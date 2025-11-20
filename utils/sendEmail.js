import nodemailer from "nodemailer";
export const sendEmail = async (data) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "screwup39@gmail.com",
      pass: "xkxfzqmsrviojsyt",
    },
  });
  const mailOption = {
    from: `"Nodejs Learning"<nodejs39@gmail.com>`,
    to: data.email,
    subject: data.subject,
    text: data.text,
  };
  await transporter.sendMail(mailOption);
};
