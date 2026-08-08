import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../api/users';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from '../components/ProfileAvatar';
import ArtworkCard from '../components/ArtworkCard';
import ArtworkGrid from '../components/ArtworkGrid';
import ArtworkFilterBar from '../components/ArtworkFilterBar';
import useArtworkFilterSort from '../hooks/useArtworkFilterSort';

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useAlert();
    const { currentUser, updateCurrentUser } = useAuth();

    const [user, setUser] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ username: '', email: '', phone: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const isOwnProfile = currentUser && currentUser._id === id;
    const filters = useArtworkFilterSort(artworks);

    const load = () => {
        setLoading(true);
        getUserProfile(id)
            .then(data => {
                setUser(data.user);
                setArtworks(data.artworks);
                setForm({ username: data.user.username, email: data.user.email, phone: data.user.phone });
            })
            .catch(err => {
                showError(err.message);
                navigate('/artworks');
            })
            .finally(() => setLoading(false));
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(load, [id]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('username', form.username);
            formData.append('email', form.email);
            formData.append('phone', form.phone);
            if (avatarFile) formData.append('avatar', avatarFile);

            const result = await updateUserProfile(id, formData);
            showSuccess(result.message);
            setUser(result.user);
            setAvatarFile(null);
            setEditing(false);
            if (isOwnProfile) updateCurrentUser(result.user);
        } catch (err) {
            showError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!user) return null;

    return (
        <div>
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    {!editing ? (
                        <div className="d-flex flex-wrap align-items-center gap-3">
                            <ProfileAvatar avatar={user.avatar} size={96} />
                            <div className="flex-grow-1">
                                <h1 className="mb-1">{user.username}</h1>
                                {user.memberSince && (
                                    <p className="text-muted small mb-2">
                                        Member since {new Date(user.memberSince).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                                    </p>
                                )}
                                <p className="mb-1"><i className="bi bi-envelope me-2"></i><a href={`mailto:${user.email}`}>{user.email}</a></p>
                                <p className="mb-2"><i className="bi bi-telephone me-2"></i><a href={`tel:${user.phone}`}>{user.phone}</a></p>
                                <p className="text-muted small mb-0">
                                    <i className="bi bi-star-fill text-warning me-1"></i>
                                    {user.ratingsGiven || 0} rating{user.ratingsGiven === 1 ? '' : 's'} given
                                    <span className="mx-2">&middot;</span>
                                    <i className="bi bi-chat-left-text me-1"></i>
                                    {user.reviewsWritten || 0} review{user.reviewsWritten === 1 ? '' : 's'} written
                                </p>
                            </div>
                            {isOwnProfile && (
                                <button className="btn btn-outline-primary btn-sm" onClick={() => setEditing(true)}>
                                    <i className="bi bi-pencil me-1"></i> Edit Profile
                                </button>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleEditSubmit}>
                            <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                                <ProfileAvatar avatar={user.avatar} size={96} />
                                <div>
                                    <label className="form-label small mb-1" htmlFor="avatar">Change profile picture</label>
                                    <input
                                        className="form-control form-control-sm"
                                        type="file"
                                        id="avatar"
                                        accept="image/png,image/jpeg"
                                        onChange={e => setAvatarFile(e.target.files[0])}
                                    />
                                </div>
                            </div>
                            <div className="row g-2">
                                <div className="col-md-4">
                                    <label className="form-label" htmlFor="username">Name</label>
                                    <input className="form-control form-control-sm" id="username" name="username" value={form.username} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label" htmlFor="email">Email</label>
                                    <input className="form-control form-control-sm" type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label" htmlFor="phone">Phone</label>
                                    <input className="form-control form-control-sm" type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="d-flex gap-2 mt-3">
                                <button className="btn btn-success" type="submit" disabled={submitting}>Save Changes</button>
                                <button className="btn btn-secondary" type="button" onClick={() => { setEditing(false); setAvatarFile(null); }}>Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <h3 className="mb-3">Your Artworks</h3>
            {artworks.length === 0 ? (
                <p>No artworks listed yet.</p>
            ) : (
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
    );
}
