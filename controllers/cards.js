const { HTTP_STATUS_OK } = require('http2').constants;
const Card = require("../models/card");
const ForbiddenAccessError = require('../errors/forbiddenAccessError');
const BadRequestError = require('../errors/badRequestError');
const NotFoundError = require('../errors/notFoundError');

const getCards = (req, res, next) => {
	Card.find({})
		.then((card) => res.send({ data: card }))
		.catch(next);
};

const createCard = (req, res, next) => {
	const { name, link } = req.body;
	Card.create({ name, link, owner: req.user._id })
		.then((card) => {
			res.status(HTTP_STATUS_OK).send({ data: card });
		})
		.catch((err) => {
			if (err.name === 'ValidationError') {
				next(new BadRequestError('Переданы некорректные данные при создании карточки'));
			} else {
				next(err);
			}
		});
};

const deleteCard = (req, res, next) => {
	const { cardId } = req.params;
	Card.findById(cardId)
		.orFail(() => new NotFoundError('Карточка не найдена'))
		.then((card) => {
			if (!card.owner.equals(req.user._id)) {
				return next(new ForbiddenAccessError('Нет прав для удаления данной карточки'));
			}
			return card.deleteOne()

				.then(() => res.send({ message: 'Карточка удалена' }));
		})
		.catch((err) => {
			if (err.name === 'CastError') {
				next(new BadRequestError('Переданы некорректные данные для удаления данной карточки'));
			} else {
				next(err);
			}
		});
};

const setLikeCard = (req, res, next) => {
	Card.findByIdAndUpdate(
		req.params.cardId,
		{ $addToSet: { likes: req.user._id } },
		{ new: true },
	)
		.then((card) => {
			if (card === null) {
				next(new NotFoundError('Карточка не найдена'));
			}
			res.send({ data: card });
		})
		.catch((err) => {
			if (err.name === 'CastError') {
				next(new BadRequestError('Переданы некорректные данные при попытке поставить лайк карточке'));
			} else {
				next(err);
			}
		});
};

const removeLikeCard = (req, res, next) => {
	Card.findByIdAndUpdate(
		req.params.cardId,
		{ $pull: { likes: req.user._id } },
		{ new: true },
	)
		.then((card) => {
			if (card) {
				res.send(card)
			} else {
        throw new NotFoundError();
      }
		})
		.catch((err) => {
			if (err.name === 'CastError') {
				next(new BadRequestError('Переданы некорректные данные при попытке убрать лайк у карточки'));
			} else {
				next(err);
			}
		});
};

module.exports = {
	getCards,
	createCard,
	setLikeCard,
	removeLikeCard,
	deleteCard
};