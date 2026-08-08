import { useMemo, useState } from 'react';
import { MEDIUMS } from '../constants';

export const SORT_OPTIONS = [
    { value: 'recent', label: 'Recently Uploaded' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'medium', label: 'Medium (A-Z)' },
    { value: 'location', label: 'Location (A-Z)' }
];

// A rating and its written review are independent, so not every review entry
// necessarily carries a numeric rating - only count/average the ones that do.
const ratedReviews = (artwork) => (artwork.reviews || []).filter(r => typeof r.rating === 'number');

const avgRating = (artwork) => {
    const reviews = ratedReviews(artwork);
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
};

const ratingCount = (artwork) => ratedReviews(artwork).length;

// Shared client-side sort/filter logic for the artwork grid, used on both the
// browse-all page and a user's profile page. Default sort is "recent" (date
// uploaded, newest first).
export default function useArtworkFilterSort(artworks) {
    const [sortBy, setSortBy] = useState('recent');
    const [medium, setMedium] = useState('');
    const [tag, setTag] = useState('');
    const [location, setLocation] = useState('');

    const tagOptions = useMemo(() => {
        const set = new Set();
        artworks.forEach(a => (a.tags || []).forEach(t => set.add(t)));
        return Array.from(set).sort();
    }, [artworks]);

    const filtered = useMemo(() => {
        const result = artworks.filter(a => {
            if (medium && a.medium !== medium) return false;
            if (tag && !(a.tags || []).includes(tag)) return false;
            if (location && !a.location?.toLowerCase().includes(location.trim().toLowerCase())) return false;
            return true;
        });

        result.sort((a, b) => {
            switch (sortBy) {
                case 'rating': {
                    // Ties (most commonly two artworks with zero ratings)
                    // fall through to rating count, then recency, so the
                    // order is always deterministic instead of looking
                    // shuffled/random.
                    const byAvg = avgRating(b) - avgRating(a);
                    if (byAvg !== 0) return byAvg;
                    const byCount = ratingCount(b) - ratingCount(a);
                    if (byCount !== 0) return byCount;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                case 'medium':
                    return (a.medium || '').localeCompare(b.medium || '');
                case 'location':
                    return (a.location || '').localeCompare(b.location || '');
                case 'recent':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        return result;
    }, [artworks, sortBy, medium, tag, location]);

    return {
        filtered,
        sortBy, setSortBy,
        medium, setMedium,
        tag, setTag,
        location, setLocation,
        tagOptions,
        sortOptions: SORT_OPTIONS,
        mediumOptions: MEDIUMS
    };
}
