const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.get('/me', auth.me);

module.exports = router;
