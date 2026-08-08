import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getArtwork, deleteArtwork, createReview, deleteReview } from '../api/artworks';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import ArtworkLocationMap from '../components/ArtworkLocationMap';
import ProfileAvatar from '../components/ProfileAvatar';
import RatingStarsInput from '../components/RatingStarsInput';
import RatingStarsDisplay from '../components/RatingStarsDisplay';
import '../styles/stars.css';

// A written review is one with actual comment text; a bare rating (stars
// only, no comment) still counts toward the average/count but isn't shown as
// its own card in the reviews list. A rating and its review text are
// independent - either can exist without the other.
const hasBody = (review) => Boolean(review.body && review.body.trim());
const hasRating = (review) => typeof review.rating === 'number';

export default function ArtworkShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { showSuccess, showError } = useAlert();

    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewBody, setReviewBody] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const load = () => {
        setLoading(true);
        getArtwork(id)
            .then(setArtwork)
            .catch(err => {
                showError(err.message);
                navigate('/artworks');
            })
            .finally(() => setLoading(false));
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(load, [id]);

    // Keep the star input / textarea in sync with whatever this user has
    // already saved for this artwork (if anything) whenever the artwork data
    // (re)loads.
    useEffect(() => {
        if (!artwork || !currentUser) return;
        const mine = artwork.reviews.find(r => r.author && r.author._id === currentUser._id);
        setReviewRating(mine?.rating || 0);
        setReviewBody(mine?.body || '');
    }, [artwork, currentUser]);

    const handleDelete = async () => {
        if (!window.confirm('Delete this artwork? This cannot be undone.')) return;
        try {
            const { message } = await deleteArtwork(id);
            showSuccess(message);
            navigate('/artworks');
        } catch (err) {
            showError(err.message);
        }
    };

    // Clicking a star saves the rating immediately - no need to press Submit
    // for that part. Submit is only for the (optional) written review text.
    const handleStarChange = async (rating) => {
        setReviewRating(rating);
        try {
            const { message } = await createReview(id, reviewBody, rating);
            showSuccess(message);
            load();
        } catch (err) {
            showError(err.message);
            load();
        }
    };

    const handleClearRating = async () => {
        if (!myReview) return;
        try {
            const { message } = await deleteReview(id, myReview._id);
            showSuccess(message);
            setReviewRating(0);
            setReviewBody('');
            load();
        } catch (err) {
            showError(err.message);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isRated && !reviewBody.trim()) {
            showError('Please add a rating or write a review.');
            return;
        }
        setSubmitting(true);
        try {
            const { message } = await createReview(id, reviewBody, reviewRating || myReview?.rating || undefined);
            showSuccess(message);
            load();
        } catch (err) {
            showError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReviewDelete = async (reviewId) => {
        try {
            const { message } = await deleteReview(id, reviewId);
            showSuccess(message);
            load();
        } catch (err) {
            showError(err.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!artwork) return null;

    const isAuthor = currentUser && artwork.artist && currentUser._id === artwork.artist._id;
    const myReview = currentUser ? artwork.reviews.find(r => r.author && r.author._id === currentUser._id) : null;
    // Trust whichever says "yes" - the just-clicked local state, or the
    // server-confirmed rating already on file for this user - so a submit
    // with empty review text never gets blocked just because the two are
    // momentarily out of sync (e.g. right after a page load).
    const isRated = Boolean(reviewRating) || hasRating(myReview || {});
    const writtenReviews = artwork.reviews.filter(hasBody);
    const ratedReviews = artwork.reviews.filter(hasRating);
    const ratingCount = ratedReviews.length;
    const avgRating = ratingCount
        ? ratedReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
        : 0;

    return (
        <div className="d-flex row mx-auto justify-content-center">
            <div className="col-lg-6 px-2">
                <div className="card">
                    <div id="artworkCarousel" className="carousel slide">
                        <div className="carousel-inner">
                            {artwork.images.map((image, i) => (
                                <div className={`carousel-item ${i === 0 ? 'active' : ''}`} key={image.filename || i}>
                                    <img
                                        src={image.url}
                                        className="d-block w-100"
                                        alt={artwork.title}
                                        style={{ height: '6cm', objectFit: 'cover' }}
                                    />
                                </div>
                            ))}
                        </div>
                        {artwork.images.length > 1 && (
                            <>
                                <button className="carousel-control-prev" type="button" data-bs-target="#artworkCarousel" data-bs-slide="prev">
                                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Previous</span>
                                </button>
                                <button className="carousel-control-next" type="button" data-bs-target="#artworkCarousel" data-bs-slide="next">
                                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Next</span>
                                </button>
                            </>
                        )}
                    </div>
                    <div className="card-body">
                        <h1 className="card-title">{artwork.title}</h1>
                        <p className="card-text">{artwork.description}</p>
                        {artwork.tags?.length > 0 && (
                            <p className="card-text">
                                {artwork.tags.map(tag => (
                                    <span className="badge bg-secondary me-1" key={tag}>{tag}</span>
                                ))}
                            </p>
                        )}
                    </div>
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item"><strong>{artwork.medium}</strong></li>
                        <li className="list-group-item">{artwork.location}</li>
                        <li className="list-group-item text-muted">
                            By - {artwork.artist ? (
                                <Link className="d-inline-flex align-items-center gap-2" to={`/users/${artwork.artist._id}`}>
                                    <ProfileAvatar avatar={artwork.artist.avatar} size={24} />
                                    {artwork.artist.username}
                                </Link>
                            ) : 'Unknown'}
                        </li>
                        <li className="list-group-item">Rs. {artwork.price}</li>
                        {artwork.createdAt && (
                            <li className="list-group-item text-muted">
                                Listed on {new Date(artwork.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </li>
                        )}
                    </ul>
                    {isAuthor && (
                        <div className="card-body">
                            <Link className="card-link btn btn-primary me-2" to={`/artworks/${artwork._id}/edit`}>EDIT</Link>
                            <button className="btn btn-danger" onClick={handleDelete}>DELETE</button>
                        </div>
                    )}
                    <div className="card-footer text-muted">
                        <Link to="/artworks">Back to Artworks</Link>
                    </div>
                </div>
            </div>
            <div className="col-lg-5 px-3">
                <ArtworkLocationMap artwork={artwork} />
                <h3 className="mt-2">Ratings &amp; Reviews</h3>
                {ratingCount > 0 ? (
                    <p className="mb-2">
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        <strong>{avgRating.toFixed(1)}</strong> average &middot; {ratingCount} rating{ratingCount !== 1 ? 's' : ''}
                    </p>
                ) : (
                    <p className="text-muted mb-2">No ratings yet.</p>
                )}
                {isAuthor ? (
                    <p className="text-muted"><i className="bi bi-info-circle me-1"></i>You can't rate or review your own artwork.</p>
                ) : currentUser ? (
                    <form className="mb-2" onSubmit={handleReviewSubmit}>
                        <div className="mb-2">
                            <label className="form-label d-block">Rate this artwork:</label>
                            <div className="d-flex align-items-center gap-2">
                                <RatingStarsInput value={reviewRating} onChange={handleStarChange} />
                                {reviewRating > 0 && (
                                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleClearRating}>
                                        <i className="bi bi-x-circle me-1"></i>Clear
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="mb-2">
                            <label className="form-label" htmlFor="body">Leave a review:</label>
                            <textarea
                                className="form-control"
                                id="body"
                                rows="3"
                                placeholder="Share what you think about this piece..."
                                value={reviewBody}
                                onChange={e => setReviewBody(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-success" disabled={submitting || (!isRated && !reviewBody.trim())}>Submit Review</button>
                    </form>
                ) : (
                    <p><Link to="/login">Log in</Link> to rate and comment on this artwork.</p>
                )}
                <hr />
                {writtenReviews.length === 0 ? (
                    <p>{isAuthor ? 'No written reviews yet.' : 'No written reviews yet. Be the first to review!'}</p>
                ) : (
                    <div className="mb-2">
                        {writtenReviews.map(review => (
                            <div className="card mb-2 bg-body-secondary" key={review._id}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h6 className="card-text">{review.author?.username}</h6>
                                        {currentUser && review.author && currentUser._id === review.author._id && (
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleReviewDelete(review._id)}>
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    {hasRating(review) && <RatingStarsDisplay rating={review.rating} />}
                                    <p className="card-text">{review.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
