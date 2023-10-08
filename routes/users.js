const router = require('express').Router();
const {
  getUsers,
  getUserId,
  createUser,
  updateUserInfo,
  updateAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.patch('/me', updateUserInfo);
router.patch('/me/avatar', updateAvatar);
router.get('/:userId', getUserId);
router.post('/', createUser);

module.exports = router;
