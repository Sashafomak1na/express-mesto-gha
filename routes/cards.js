const router = require("express").Router();
const { celebrate, Joi } = require('celebrate');
const { URL_VALIDATION } = require('../utils/constants');

const {
  getCards,
  createCard,
  setLikeCard,
  removeLikeCard,
  deleteCard
} = require("../controllers/cards");

router.get('/', getCards);

router.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(URL_VALIDATION),
  }),
}), createCard);

router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
}), deleteCard);

router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
}), setLikeCard);

router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
}), removeLikeCard);

module.exports = router;