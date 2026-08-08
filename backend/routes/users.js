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

router.route('/:id/follow')
    .post(isLoggedIn, users.follow)
    .delete(isLoggedIn, users.unfollow);

router.get('/:id/followers', users.followers);
router.get('/:id/following', users.following);

module.exports = router;
