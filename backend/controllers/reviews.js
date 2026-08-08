const Review = require('../models/review');
const Artwork = require('../models/artwork');

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const artwork = await Artwork.findById(id);
    if (!artwork) return res.status(404).json({ message: 'Cannot find that artwork!' });
    if (artwork.artist.equals(req.user._id)) {
        return res.status(403).json({ message: 'You cannot rate or review your own artwork!' });
    }
    if (req.body.rating === undefined && !req.body.body) {
        return res.status(400).json({ message: 'Please give a rating or write a review.' });
    }

    // One rating/review per user per artwork - clicking a star saves the
    // rating immediately, and later adding review text just updates that
    // same entry rather than creating a second one. A rating and its written
    // review are independent: either can be submitted without the other.
    let review = await Review.findOne({ artwork: id, author: req.user._id });
    let created = false;
    if (review) {
        if (req.body.rating !== undefined) review.rating = req.body.rating;
        review.body = req.body.body || '';
        await review.save();
    } else {
        created = true;
        review = new Review(req.body);
        review.author = req.user._id;
        review.artwork = artwork._id;
        artwork.reviews.push(review);
        await review.save();
        await artwork.save();
    }
    await review.populate('author', 'username');

    const message = review.body ? 'Successfully saved your review!' : 'Successfully saved your rating!';
    res.status(created ? 201 : 200).json({ review, message });
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Artwork.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Successfully deleted the review!' });
};
