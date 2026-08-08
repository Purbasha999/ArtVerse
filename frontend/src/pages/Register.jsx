import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

export default function Register() {
    const { register } = useAuth();
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            showError('Passwords must match.');
            return;
        }
        setSubmitting(true);
        try {
            const message = await register(form.username, form.email, form.phone, form.password, form.confirmPassword);
            showSuccess(message);
            navigate('/artworks');
        } catch (err) {
            showError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mt-3">
            <div className="row justify-content-center">
                <div className="col-md-6 col-xl-4">
                    <div className="card shadow">
                        <img
                            src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1740&auto=format&fit=crop"
                            alt=""
                            className="card-img-top"
                            style={{ height: '180px', objectFit: 'cover' }}
                        />
                        <div className="card-body">
                            <h3 className="card-title">Sign Up</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="username">Enter Name</label>
                                    <input className="form-control form-control-sm" type="text" id="username" name="username" autoFocus required value={form.username} onChange={handleChange} />
                                    <div className="form-text">This will also be your username.</div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="email">Enter Email</label>
                                    <input className="form-control form-control-sm" type="email" id="email" name="email" required value={form.email} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="phone">Enter Phone Number</label>
                                    <input className="form-control form-control-sm" type="tel" id="phone" name="phone" required value={form.phone} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="password">Enter Password</label>
                                    <input className="form-control form-control-sm" type="password" id="password" name="password" required value={form.password} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                                    <input className="form-control form-control-sm" type="password" id="confirmPassword" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} />
                                </div>
                                <button className="btn btn-success w-100" disabled={submitting}>Register</button>
                            </form>
                            <p className="mt-3 mb-0 text-center">
                                Already have an account? <Link to="/login">Log in</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
