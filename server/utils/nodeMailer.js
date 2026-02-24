import { createTransport } from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import { config } from "dotenv";

config();

const TOKEN = process.env.MAILTRAP_API_KEY;

const transport = createTransport(
  MailtrapTransport({
    token: TOKEN,
  }),
);

const sender = {
  address: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};
const recipients = ["yidar70429@ostahie.com"];

transport
  .sendMail({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    text: "Congrats for sending test email with Mailtrap!",
    category: "Integration Test",
  })
  .then(console.log, console.error);
