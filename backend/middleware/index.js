const { artworkSchema, reviewSchema } = require('../validators/schemas');
const ExpressError = require('../utils/ExpressError');
const Artwork = require('../models/artwork');
const Review = require('../models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be signed in first!' });
    }
    next();
};

module.exports.validateArtwork = (req, res, next) => {
    const { error } = artworkSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    next();
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const artwork = await Artwork.findById(id);
    if (!artwork) {
        return res.status(404).json({ message: 'Cannot find that artwork!' });
    }
    if (!artwork.artist.equals(req.user._id)) {
        return res.status(403).json({ message: 'You do not have permission to do that!' });
    }
    next();
};

module.exports.isSelf = (req, res, next) => {
    const { id } = req.params;
    if (!req.user._id.equals(id)) {
        return res.status(403).json({ message: 'You do not have permission to do that!' });
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({ message: 'Cannot find that review!' });
    }
    if (!review.author.equals(req.user._id)) {
        return res.status(403).json({ message: 'You do not have permission to do that!' });
    }
    next();
};
