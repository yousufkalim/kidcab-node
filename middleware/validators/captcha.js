const axios = require("axios").default;
const CAPTCHA_PRIVATE_KEY = process.env.CAPTCHA_PRIVATE_KEY;
exports.validateCaptcha = async (req, res, next) => {
  try {
    const { captchaToken } = req.body;

    // Call Google's API to get score
    const res = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${CAPTCHA_PRIVATE_KEY}&response=${captchaToken}`
    );
    // Extract result from the API response
    if (res.data.success) next();
    else return res.status(400).send({ error: "Bot Spotted" });
  } catch (error) {
    return res.status(401).send({ error: "Please authenticated" });
  }
};
