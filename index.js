const express = require("express");
const validator = require("email-validator");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

app.post("/validate", async (req, res) => {
  const { email } = req.body;
  if (!validator.validate(email)) {
    return res.status(400).json({ valid: false, reason: "Invalid format" });
  }

  const domain = email.split("@")[1];
  const transporter = nodemailer.createTransport({
    host: domain,
    port: 25,
    secure: false,
    tls: { rejectUnauthorized: false }
  });

  try {
    await transporter.verify();
    res.json({ valid: true });
  } catch (e) {
    res.status(400).json({ valid: false, reason: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SMTP Validator API running on ${PORT}`));
