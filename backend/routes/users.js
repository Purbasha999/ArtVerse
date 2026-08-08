const express = require('express');
const router = express.Router();
const multer = require('multer');
const { avatarStorage } = require('../config/cloudinary');
const upload = multer({ storage: avatarStorage });
const { isLoggedIn, isSelf } = require('../middleware');
const users = require('../controllers/users');

router.route('/:id')
    .get(users.show)
    .put(isLoggedIn, isSelf, upload.single('avatar'), users.update);

module.exports = router;
