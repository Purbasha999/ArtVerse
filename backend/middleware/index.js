const { artworkSchema, reviewSchema } = require('../validators/schemas');
const ExpressError = require('../utils/ExpressError');
const Artwork = require('../models/artwork');
const Review = require('../models/review');
const User = require('../models/user');
const { COOKIE_NAME, verifyToken } = require('../utils/jwt');

// Runs on every request. If a valid JWT cookie is present, loads the user it
// identifies onto req.user; otherwise just moves on with req.user left
// unset. Routes stay reachable either way - isLoggedIn below is what
// actually rejects unauthenticated requests where that's required.
module.exports.attachUser = async (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return next();
    try {
        const payload = verifyToken(token);
        const user = await User.findById(payload.id);
        if (user) req.user = user;
    } catch (e) {
        // Invalid/expired token - treat the request as unauthenticated
        // rather than erroring it out.
    }
    next();
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.user) {
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
