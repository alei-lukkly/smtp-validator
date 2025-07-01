const express = require("express");
const validator = require("email-validator");
const SMTPConnection = require("smtp-connection");

const app = express();
app.use(express.json());

app.post("/validate", async (req, res) => {
  const { email } = req.body;
  if (!validator.validate(email)) {
    return res.status(400).json({ valid: false, reason: "Invalid format" });
  }

  const domain = email.split("@")[1];
  const connection = new SMTPConnection({ port: 25, host: domain, tls: { rejectUnauthorized: false }, socketTimeout: 3000 });

  connection.on("error", () => {});
  connection.connect(() => {
    connection.quit();
    res.json({ valid: true });
  });

  setTimeout(() => {
    connection.close();
    res.status(408).json({ valid: false, reason: "Timeout" });
  }, 5000);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SMTP Validator API running on ${PORT}`));