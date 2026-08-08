import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getArtwork, deleteArtwork, createReview, deleteReview } from '../api/artworks';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import ArtworkLocationMap from '../components/ArtworkLocationMap';
import RatingStarsInput from '../components/RatingStarsInput';
import RatingStarsDisplay from '../components/RatingStarsDisplay';
import '../styles/stars.css';

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

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewRating) {
            showError('Please select a rating.');
            return;
        }
        setSubmitting(true);
        try {
            const { message } = await createReview(id, reviewBody, reviewRating);
            showSuccess(message);
            setReviewBody('');
            setReviewRating(0);
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

    return (
        <div className="d-flex row mx-auto justify-content-center">
            <div className="col-lg-6 px-2">
                <div className="card">
                    <div id="artworkCarousel" className="carousel slide">
                        <div className="carousel-inner">
                            {artwork.images.map((image, i) => (
                                <div className={`carousel-item ${i === 0 ? 'active' : ''}`} key={image.filename || i}>
                                    <img src={image.url} className="d-block w-100" alt={artwork.title} />
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
                        <li className="list-group-item">{artwork.medium}</li>
                        <li className="list-group-item">{artwork.location}</li>
                        <li className="list-group-item text-muted">
                            By - {artwork.artist ? (
                                <Link to={`/users/${artwork.artist._id}`}>{artwork.artist.username}</Link>
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
                <h3 className="mt-2">Reviews</h3>
                {currentUser ? (
                    <form className="mb-2" onSubmit={handleReviewSubmit}>
                        <div className="mb-2">
                            <label className="form-label">Rate this artwork:</label>
                            <RatingStarsInput value={reviewRating} onChange={setReviewRating} />
                        </div>
                        <div className="mb-2">
                            <label className="form-label" htmlFor="body">Leave a review:</label>
                            <textarea
                                className="form-control"
                                id="body"
                                rows="3"
                                required
                                value={reviewBody}
                                onChange={e => setReviewBody(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-success" disabled={submitting}>Submit</button>
                    </form>
                ) : (
                    <p><Link to="/login">Log in</Link> to rate and comment on this artwork.</p>
                )}
                <hr />
                {artwork.reviews.length === 0 ? (
                    <p>No reviews yet. Be the first to review!</p>
                ) : (
                    <div className="mb-2">
                        {artwork.reviews.map(review => (
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
                                    <RatingStarsDisplay rating={review.rating} />
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
