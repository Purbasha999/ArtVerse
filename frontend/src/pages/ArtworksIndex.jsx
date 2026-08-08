import { useEffect, useState } from 'react';
import { listArtworks } from '../api/artworks';
import ArtworkCard from '../components/ArtworkCard';
import ArtworkGrid from '../components/ArtworkGrid';
import ArtworkFilterBar from '../components/ArtworkFilterBar';
import ClusterMap from '../components/ClusterMap';
import useArtworkFilterSort from '../hooks/useArtworkFilterSort';
import { useAlert } from '../context/AlertContext';

export default function ArtworksIndex() {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showError } = useAlert();
    const filters = useArtworkFilterSort(artworks);

    useEffect(() => {
        listArtworks()
            .then(setArtworks)
            .catch(err => showError(err.message))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <ClusterMap artworks={artworks} />
            <div className="container mt-3">
                <h1 style={{ paddingTop: '12px' }}>Artworks</h1>
                {loading && <p>Loading artworks...</p>}
                {!loading && artworks.length === 0 && (
                    <p>No artworks listed yet. Be the first to sell one!</p>
                )}
                {!loading && artworks.length > 0 && (
                    <>
                        <ArtworkFilterBar controls={filters} />
                        {filters.filtered.length === 0 ? (
                            <p>No artworks match your filters.</p>
                        ) : (
                            <ArtworkGrid>
                                {filters.filtered.map(artwork => (
                                    <ArtworkCard key={artwork._id} artwork={artwork} />
                                ))}
                            </ArtworkGrid>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
