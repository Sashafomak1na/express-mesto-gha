const router = require('express').Router();
const { ERR_NOT_FOUND } = require('../errors/errors');

router.use((req, res) => {
  res.status(ERR_NOT_FOUND).send({ message: 'Page with this requested URL does not exist' });
});

module.exports = router;
