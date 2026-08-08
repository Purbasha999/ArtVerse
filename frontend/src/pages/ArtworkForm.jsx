import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getArtwork, createArtwork, updateArtwork } from '../api/artworks';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { MEDIUMS } from '../constants';

const emptyForm = { title: '', location: '', description: '', medium: MEDIUMS[0], tags: '', price: '' };

export default function ArtworkForm({ mode }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { showSuccess, showError } = useAlert();

    const [form, setForm] = useState(emptyForm);
    const [existingImages, setExistingImages] = useState([]);
    const [deleteImages, setDeleteImages] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(mode === 'edit');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (mode !== 'edit') return;
        getArtwork(id).then(artwork => {
            if (currentUser && artwork.artist && artwork.artist._id !== currentUser._id) {
                showError('You do not have permission to do that!');
                navigate(`/artworks/${id}`);
                return;
            }
            setForm({
                title: artwork.title,
                location: artwork.location,
                description: artwork.description || '',
                medium: artwork.medium,
                tags: (artwork.tags || []).join(', '),
                price: artwork.price
            });
            setExistingImages(artwork.images);
        }).catch(err => {
            showError(err.message);
            navigate('/artworks');
        }).finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, mode]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const toggleDeleteImage = (filename) => {
        setDeleteImages(prev => prev.includes(filename) ? prev.filter(f => f !== filename) : [...prev, filename]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('location', form.location);
            formData.append('description', form.description);
            formData.append('medium', form.medium);
            formData.append('tags', form.tags);
            formData.append('price', form.price);
            files.forEach(file => formData.append('images', file));
            deleteImages.forEach(filename => formData.append('deleteImages', filename));

            const result = mode === 'create'
                ? await createArtwork(formData)
                : await updateArtwork(id, formData);

            showSuccess(result.message);
            navigate(`/artworks/${result.artwork._id}`);
        } catch (err) {
            showError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="row">
            <h1 className="text-center">{mode === 'create' ? 'List a New Artwork' : 'Edit Artwork'}</h1>
            <div className="col-md-6 offset-md-3">
                <form className="my-4" onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="title">Title</label>
                        <input className="form-control" type="text" id="title" name="title" value={form.title} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="location">Selling Location</label>
                        <input
                            className="form-control"
                            type="text"
                            id="location"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Jaipur, Rajasthan"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="medium">Medium</label>
                        <select className="form-select" id="medium" name="medium" value={form.medium} onChange={handleChange}>
                            {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="tags">Tags (comma separated)</label>
                        <input
                            className="form-control"
                            type="text"
                            id="tags"
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            placeholder="portrait, abstract, folk art"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="description">Description</label>
                        <textarea className="form-control" rows="3" id="description" name="description" value={form.description} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="image">Upload image(s):</label>
                        <input
                            className="form-control form-control-sm"
                            id="image"
                            type="file"
                            multiple
                            accept="image/png,image/jpeg"
                            onChange={e => setFiles(Array.from(e.target.files))}
                        />
                        {files.length > 0 && (
                            <ul className="mt-2 small text-muted">
                                {files.map(f => <li key={f.name}>{f.name}</li>)}
                            </ul>
                        )}
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="price">Price</label>
                        <div className="input-group has-validation">
                            <span className="input-group-text">Rs.</span>
                            <input
                                className="form-control"
                                type="number"
                                min="0"
                                placeholder="0"
                                id="price"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    {mode === 'edit' && existingImages.length > 0 && (
                        <div className="mb-3">
                            <label className="form-label d-block">Existing images (check to delete):</label>
                            {existingImages.map((img, i) => (
                                <span key={img.filename || i} className="d-inline-block me-3 mb-2 text-center">
                                    <img
                                        className="img-thumbnail d-block"
                                        src={img.thumbnail || img.url}
                                        alt=""
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                    <input
                                        type="checkbox"
                                        id={`image-${i}`}
                                        checked={deleteImages.includes(img.filename)}
                                        onChange={() => toggleDeleteImage(img.filename)}
                                    />
                                    <label htmlFor={`image-${i}`} className="ms-1">Delete</label>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="d-flex gap-2">
                        <button className="btn btn-success" type="submit" disabled={submitting}>
                            {mode === 'create' ? 'List Artwork' : 'Update Artwork'}
                        </button>
                        <Link className="btn btn-primary" to={mode === 'create' ? '/artworks' : `/artworks/${id}`}>Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
