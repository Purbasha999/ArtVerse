export default function RatingStarsDisplay({ rating }) {
    return <p className="starability-result" data-rating={rating}>Rated: {rating} stars</p>;
}
