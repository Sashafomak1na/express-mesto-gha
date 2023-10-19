const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../utils/constants');
const AuthenticationError = require('../errors/authenticationError');

module.exports = (req, res, next) => {
  if (!req.cookies.jwt) {
    return next(new AuthenticationError('Неправильные почта или пароль'));
  }
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return next(new AuthenticationError('Неправильные почта или пароль'));
  }
  req.user = payload;
  return next();
};
