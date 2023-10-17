const mongoose = require("mongoose");
const validator = require('validator');
const { URL_REGEX } = require('../utils/constants');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: ({ length }) => length >= 2 && length <= 30,
      message: 'Имя карточки должно быть длиной от 2 до 30 символов',
    }
  },

  link: {
    type: String,
    required: true,
    validate: {
      validator: (link) => URL_VALIDATION.test(link),
      message: 'Требуется ввести корректный URL',
    }
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },

  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: []
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model("card", cardSchema);