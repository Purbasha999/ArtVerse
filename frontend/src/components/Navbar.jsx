import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import ProfileAvatar from './ProfileAvatar';

export default function Navbar() {
    const { currentUser, logout } = useAuth();
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const message = await logout();
            showSuccess(message);
            navigate('/artworks');
        } catch (err) {
            showError(err.message);
        }
    };

    return (
        <nav className="navbar navbar-dark bg-dark navbar-expand-sm sticky-top">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">ArtVerse</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavDropdown">
                    <div className="navbar-nav gap-2">
                        <NavLink className="nav-link" to="/artworks">Browse Artworks</NavLink>
                        <NavLink className="nav-link" to="/artworks/new">List Your Artwork</NavLink>
                    </div>
                    <div className="navbar-nav ms-auto gap-2">
                        {!currentUser ? (
                            <>
                                <NavLink className="nav-link" to="/login">Login</NavLink>
                                <NavLink className="nav-link" to="/register">Register</NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink className="nav-link d-flex align-items-center gap-2" to={`/users/${currentUser._id}`}>
                                    <ProfileAvatar avatar={currentUser.avatar} size={24} />
                                    Hi, {currentUser.username}
                                </NavLink>
                                <a href="/logout" className="nav-link" onClick={handleLogout}>Logout</a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
