const Review = require('../models/review');
const Artwork = require('../models/artwork');

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const artwork = await Artwork.findById(id);
    if (!artwork) return res.status(404).json({ message: 'Cannot find that artwork!' });

    const review = new Review(req.body);
    review.author = req.user._id;
    review.artwork = artwork._id;
    artwork.reviews.push(review);
    await review.save();
    await artwork.save();
    await review.populate('author', 'username');

    res.status(201).json({ review, message: 'Successfully added a review!' });
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Artwork.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Successfully deleted the review!' });
};
