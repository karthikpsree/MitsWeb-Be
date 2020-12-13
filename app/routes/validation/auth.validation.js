const Joi = require("joi");

let signupScheme = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  password: Joi.string().required(),
  confirm: Joi.string().required(),
  number: Joi.number().required(),
});

let loginScheme = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const validateRegistration = (req, res, next) => {
  const { error, value } = signupScheme.validate(req.body);
  error ? res.json({ msg: error, success: false }) : next();
};

const validateLogin = (req, res, next) => {
  const { error, value } = loginScheme.validate(req.body);
  error ? res.json({ msg: error, success: false }) : next();
};

module.exports = {
  validateRegistration,
  validateLogin,
};