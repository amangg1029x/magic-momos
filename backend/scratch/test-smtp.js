const nodemailer = require("nodemailer");

async function test(port) {
  const t = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: port,
    secure: false,
    auth: {
      user: "magicmomos12@gmail.com",
      pass: process.env.BREVO_SMTP_KEY,
    },
  });
  try {
    const info = await t.sendMail({
      from: '"Magic Momos" <magicmomos12@gmail.com>',
      to: "amangg1029@gmail.com",
      subject: `Test Brevo SMTP port ${port}`,
      html: `<a href="https://magicmomos.app/?token=test&email=test%40gmail.com#reset-password">RESET PASSWORD</a>`,
    });
    console.log(`Port ${port}: SUCCESS`, info.messageId);
  } catch (e) {
    console.error(`Port ${port}: FAILED -`, e.message);
  }
}

test(587).then(() => test(2525));
