const User = require('../models/user');
const Artwork = require('../models/artwork');
const Review = require('../models/review');
const { cloudinary } = require('../config/cloudinary');

module.exports.show = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id, 'username email phone avatar createdAt');
    if (!user) {
        return res.status(404).json({ message: 'Cannot find that user!' });
    }
    const [artworks, ratingsGiven, reviewsWritten] = await Promise.all([
        Artwork.find({ artist: id }).populate('reviews', 'rating').sort('-createdAt'),
        Review.countDocuments({ author: id, rating: { $exists: true } }),
        Review.countDocuments({ author: id, body: { $exists: true, $ne: '' } })
    ]);
    res.json({
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            memberSince: user.createdAt,
            ratingsGiven,
            reviewsWritten
        },
        artworks
    });
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: 'Cannot find that user!' });
    }

    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;

    if (req.file) {
        if (user.avatar?.filename) {
            await cloudinary.uploader.destroy(user.avatar.filename);
        }
        user.avatar = { url: req.file.path, filename: req.file.filename };
    }

    try {
        await user.save();
    } catch (e) {
        if (e.code === 11000) {
            return res.status(400).json({ message: 'That username or email is already in use.' });
        }
        return res.status(400).json({ message: e.message });
    }

    res.json({
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            memberSince: user.createdAt
        },
        message: 'Profile updated successfully!'
    });
};
