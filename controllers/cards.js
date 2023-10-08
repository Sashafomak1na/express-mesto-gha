const Card = require('../models/card');
const {
  ERR_BAD_REQUEST,
  ERR_NOT_FOUND,
  ERROR_INTERNAL_SERVER,
} = require('../errors/errors');

// id карточки
const checkCard = (card, res) => {
  if (card) {
    return res.send(card);
  }
  return res
    .status(ERR_NOT_FOUND)
    .send({ message: 'Card with this id is not found' });
};

// Данных карточек
const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch(() => {
      res.status(ERROR_INTERNAL_SERVER).send({ message: 'На сервере произошла ошибка' });
    });
};

// Создание карточки
const createCard = (req, res) => {
  const data = new Date();
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => {
      res.status(200).send({
        name: card.name,
        link: card.link,
        owner: card.owner,
        _id: card._id,
        createdAt: data,
      });
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res
          .status(ERR_BAD_REQUEST)
          .send({ message: 'Your personal details were not entered correctly' });
      }
      return res
        .status(ERROR_INTERNAL_SERVER)
        .send({ message: 'На сервере произошла ошибка' });
    });
};

// Удаление карточки
const deleteCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndDelete(cardId)
    .then((card) => checkCard(card, res))
    .catch((error) => {
      if (error.name === 'CastError') {
        return res
          .status(ERR_BAD_REQUEST)
          .send({ message: 'Card is not found' });
      }
      res.status(ERROR_INTERNAL_SERVER).send({ message: 'На сервере произошла ошибка' });
      return error;
    });
};

// Лайк карточке
const setLikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => checkCard(card, res))
    .catch((error) => {
      if (error.name === 'CastError') {
        return res
          .status(ERR_BAD_REQUEST)
          .send({ message: 'Card is not found' });
      }
      return res
        .status(ERROR_INTERNAL_SERVER)
        .send({ message: 'На сервере произошла ошибка' });
    });
};

// Снятие лайка
const setDislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => checkCard(card, res))
    .catch((error) => {
      if (error.name === 'CastError') {
        return res
          .status(ERR_BAD_REQUEST)
          .send({ message: 'Card is not found' });
      }
      return res
        .status(ERROR_INTERNAL_SERVER)
        .send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports = {
  getCards,
  createCard,
  setLikeCard,
  setDislikeCard,
  deleteCard,
};
