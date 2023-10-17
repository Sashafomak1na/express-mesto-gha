const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../utils/constants');
console.log(jwt);
const AuthenticationError = require('../errors/authenticationError');
const ConflictRequestError = require('../errors/conflictRequestError');
const BadRequestError = require('../errors/badRequestError');
const NotFoundError = require('../errors/notFoundError');

const getUsers = (req, res, next) => {
	User.find({})
		.then((users) => res.send({ data: users }))
		.catch(next);
};

const createUser = (req, res, next) => {
	const {
		name, about, avatar, email, password,
	} = req.body;

	if (!email || !password) {
		next(new BadRequestError('Не передан электронный адрес или пароль'));
	}
	bcrypt.hash(req.body.password, 10)
		.then((hash) => User.create({
			name,
			about,
			avatar,
			email,
			password: hash,
		}))
		.then((user) => res.status(201).send({
			data: {
				name: user.name, about: user.about, avatar: user.avatar, email: user.email, _id: user.id,
			},
		}))
		.catch((err) => {
			if (err.name === 'ValidationError') {
				next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
			}
			if (err.code === 11000) {
				next(new ConflictRequestError('Пользователь с указанным электронным адресом уже зарегистрирован'));
			} else {
				next(err);
			}
		});
};

const getUserId = (req, res, next) => {
	User.findById(req.params.userId)
		.then((user) => {
			if (user === null) {
				next(new NotFoundError('Пользователь с указанным id не зарегистрирован'));
			}
			res.send({ data: user });
		})
		.catch((err) => {
			if (err.name === 'CastError') {
				next(new BadRequestError('Передан некорректный id пользователя'));
			} else {
				next(err);
			}
		});
};

const updateUserInfo = (req, res, next) => {
	const { name, about } = req.body;
	User.findByIdAndUpdate(
		req.user._id,
		{ name, about },
		{
			new: true,
			runValidators: true,
			upsert: false,
		},
	)
		.then((user) => {
			if (user) {
				res.send({ data: user });
			}
			if (!user) {
				next(new NotFoundError('Пользователь с указанным id не зарегистрирован'));
			}
		})
		.catch((err) => {
			if (err.name === 'ValidationError') {
				next(new BadRequestError('Переданы некорректные данные при обновлении информации о пользователе'));
			} else {
				next(err);
			}
		});
};

const getCurrentUserInfo = (req, res, next) => {
	User.findById(req.user._id)
		.then((data) => {
			if (!data) {
				next(new NotFoundError('Пользователь с указанным id не зарегистрирован'));
			}
			res.send({ data });
		})
		.catch((err) => {
			if (err.name === 'CastError') {
				next(new BadRequestError('Передан некорректный id пользователя'));
			} else {
				next(err);
			}
		});
};

const updateAvatar = (req, res, next) => {
	const { avatar } = req.body;
	User.findByIdAndUpdate(
		req.user._id,
		{ avatar },
		{
			new: true,
			runValidators: true,
			upsert: false,
		},
	)
		.then((user) => {
			if (user) {
				res.send({ data: user });
			}
			if (!user) {
				next(new NotFoundError('Пользователь с указанным id не зарегистрирован'));
			}
		})
		.catch((err) => {
			if (err.name === 'ValidationError') {
				next(new BadRequestError('Переданы некорректные данные при обновлении аватара пользователя'));
			} else {
				next(err);
			}
		});
};

const login = (req, res, next) => {
	const { email, password } = req.body;
	return User.findUserByCredentials(email, password)
		.then((user) => {
			if (!email || !password) {
				next(new AuthenticationError('Ошибка авторизации'));
			}
			const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '7d' });
			return res
				.cookie('jwt', token, {
					maxAge: 3600000,
					httpOnly: true,
				})
				.send({ message: 'Успешная авторизация' });
		})
		.catch(next);
};

module.exports = {
	getUsers,
	createUser,
	getUserId,
	getCurrentUserInfo,
	updateUserInfo,
	updateAvatar,
	login
};