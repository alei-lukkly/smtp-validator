const express = require("express");
const validator = require("email-validator");
const dns = require("dns");

const app = express();
app.use(express.json());

// ✅ Разрешаем запросы с фронтенда
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function checkMX(domain) {
  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return reject("No MX records found");
      }
      resolve(true);
    });
  });
}

app.post("/validate", async (req, res) => {
  const { email } = req.body;

  if (!validator.validate(email)) {
    return res.status(400).json({ valid: false, reason: "Invalid format" });
  }

  const domain = email.split("@")[1];

  try {
    await checkMX(domain);
    res.json({ is_valid: true });
  } catch (err) {
    res.status(400).json({ is_valid: false, reason: err });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SMTP Validator API running on port ${PORT}`));
