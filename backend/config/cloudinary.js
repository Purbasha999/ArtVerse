const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ArtVerse',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ArtVerse/avatars',
        allowedFormats: ['jpeg', 'png', 'jpg'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
    }
});

module.exports = {
    cloudinary, storage, avatarStorage
};
