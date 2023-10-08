const router = require('express').Router();
const {
  getCards,
  createCard,
  setLikeCard,
  setDislikeCard,
  deleteCard,
} = require('../controllers/cards');

router.get('/', getCards);
router.post('/', createCard);
router.put('/:cardId/likes', setLikeCard);
router.delete('/:cardId/likes', setDislikeCard);
router.delete('/:cardId', deleteCard);

module.exports = router;
