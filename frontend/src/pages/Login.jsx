import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

export default function Login() {
    const { login } = useAuth();
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ username: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const message = await login(form.username, form.password);
            showSuccess(message);
            navigate(location.state?.returnTo || '/artworks');
        } catch (err) {
            showError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mt-2">
            <div className="row justify-content-center">
                <div className="col-md-6 col-xl-4">
                    <div className="card shadow" style={{ maxWidth: '380px', margin: '0 auto' }}>
                        <img
                            src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1740&auto=format&fit=crop"
                            alt=""
                            className="card-img-top"
                            style={{ height: '180px', objectFit: 'cover' }}
                        />
                        <div className="card-body">
                            <h3 className="card-title">Log In</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="username">Enter Username</label>
                                    <input
                                        className="form-control form-control-sm"
                                        type="text"
                                        id="username"
                                        autoFocus
                                        required
                                        value={form.username}
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="password">Enter Password</label>
                                    <input
                                        className="form-control form-control-sm"
                                        type="password"
                                        id="password"
                                        required
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                    />
                                </div>
                                <button className="btn btn-success w-100" disabled={submitting}>Log In</button>
                            </form>
                            <p className="mt-3 mb-0 text-center">
                                New to ArtVerse? <Link to="/register">Register</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
