const User = require('../models/user');
const Artwork = require('../models/artwork');
const Review = require('../models/review');
const { cloudinary } = require('../config/cloudinary');

module.exports.show = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id, 'username email phone avatar createdAt followers following');
    if (!user) {
        return res.status(404).json({ message: 'Cannot find that user!' });
    }
    const [artworks, ratingsGiven, reviewsWritten] = await Promise.all([
        Artwork.find({ artist: id }).populate('reviews', 'rating').sort('-createdAt'),
        Review.countDocuments({ author: id, rating: { $exists: true } }),
        Review.countDocuments({ author: id, body: { $exists: true, $ne: '' } })
    ]);
    const isFollowing = Boolean(req.user) && user.followers.some(f => f.equals(req.user._id));
    res.json({
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            memberSince: user.createdAt,
            ratingsGiven,
            reviewsWritten,
            artworkCount: artworks.length,
            followersCount: user.followers.length,
            followingCount: user.following.length,
            isFollowing
        },
        artworks
    });
};

module.exports.follow = async (req, res) => {
    const { id } = req.params;
    if (id === String(req.user._id)) {
        return res.status(400).json({ message: 'You cannot follow yourself!' });
    }
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: 'Cannot find that user!' });

    await User.findByIdAndUpdate(id, { $addToSet: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: id } });
    res.json({ message: `You are now following ${target.username}.` });
};

module.exports.unfollow = async (req, res) => {
    const { id } = req.params;
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: 'Cannot find that user!' });

    await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
    res.json({ message: `Unfollowed ${target.username}.` });
};

module.exports.followers = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate('followers', 'username avatar');
    if (!user) return res.status(404).json({ message: 'Cannot find that user!' });
    res.json({ users: user.followers });
};

module.exports.following = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate('following', 'username avatar');
    if (!user) return res.status(404).json({ message: 'Cannot find that user!' });
    res.json({ users: user.following });
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
