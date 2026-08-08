const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const { isLoggedIn, validateArtwork, isAuthor } = require('../middleware');
const artworks = require('../controllers/artworks');

router.route('/')
    .get(artworks.index)
    .post(isLoggedIn, upload.array('images', 8), validateArtwork, artworks.create);

router.route('/:id')
    .get(artworks.show)
    .put(isLoggedIn, isAuthor, upload.array('images', 8), validateArtwork, artworks.update)
    .delete(isLoggedIn, isAuthor, artworks.destroy);

module.exports = router;
