import { Link } from 'react-router-dom';
import styles from '../styles/artworkCard.module.css';

export default function ArtworkCard({ artwork }) {
    const thumb = artwork.images?.[0]?.url?.replace('/upload', '/upload/c_fill,w_500,dpr_auto');
    // A rating and its written review are independent, so not every review
    // entry necessarily has a numeric rating - only average the ones that do.
    const ratedReviews = (artwork.reviews || []).filter(r => typeof r.rating === 'number');
    const avgRating = ratedReviews.length ? ratedReviews.reduce((sum, r) => sum + r.rating, 0) / ratedReviews.length : 0;

    return (
        <div className={`card ${styles.card}`}>
            <Link to={`/artworks/${artwork._id}`}>
                <div className={styles.imageWrap}>
                    {thumb ? (
                        <img className={styles.image} src={thumb} alt={artwork.title} />
                    ) : (
                        <div className={styles.imagePlaceholder}><i className="bi bi-image"></i></div>
                    )}
                </div>
            </Link>
            <div className="card-body">
                <h5 className="card-title mb-1">{artwork.title}</h5>
                <p className="card-text text-muted small mb-1">{artwork.medium} &middot; {artwork.location}</p>
                {ratedReviews.length > 0 ? (
                    <p className="card-text small mb-1">
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        {avgRating.toFixed(1)} ({ratedReviews.length})
                    </p>
                ) : (
                    <p className="card-text small text-muted mb-1">No ratings yet</p>
                )}
                <p className="card-text fw-bold mb-1">Rs. {artwork.price}</p>
                {artwork.createdAt && (
                    <p className="card-text"><small className="text-muted">Listed on {new Date(artwork.createdAt).toLocaleDateString()}</small></p>
                )}
                <Link className="btn btn-primary btn-sm w-100" to={`/artworks/${artwork._id}`}>View Details</Link>
            </div>
        </div>
    );
}
