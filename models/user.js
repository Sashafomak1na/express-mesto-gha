const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const validator = require('validator');
const { URL_VALIDATION } = require('../utils/constants');
const AuthenticationError = require('../errors/authenticationError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто'
  },

  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь'
  },

  avatar: {
    type: String,
    required: true,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (link) => URL_VALIDATION.test(link),
      message: 'Требуется ввести URL'
    },
  },

  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Требуется ввести корректный e-mail'],
  },

  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthenticationError('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)

        .then((matched) => {
          if (!matched) {
            return Promise.reject(new AuthenticationError('Неправильные почта или пароль'));
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);