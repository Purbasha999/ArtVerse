import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import Footer from '../components/Footer';
import styles from '../styles/home.module.css';

const FEATURES = [
    {
        icon: 'bi-search-heart',
        title: 'Discover',
        text: "Browse original artwork from independent artists across India - filter by medium, tags, or the city it's made in."
    },
    {
        icon: 'bi-easel3',
        title: 'Showcase & Sell',
        text: 'List your own paintings, sculptures, photography or crafts in minutes with photos, pricing, and a pinned selling location.'
    },
    {
        icon: 'bi-star-half',
        title: 'Rate & Connect',
        text: 'Leave star ratings and comments on pieces you love, and help fellow art lovers find their next favorite artist.'
    }
];

const CATEGORIES = [
    'Oil Painting', 'Watercolor', 'Sculpture', 'Photography', 'Pottery & Ceramics', 'Textile & Fabric Art'
];

export default function Home() {
    const { currentUser, logout } = useAuth();
    const { showSuccess, showError } = useAlert();

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            showSuccess(await logout());
        } catch (err) {
            showError(err.message);
        }
    };

    return (
        <div className={styles.homePage}>
            <div className={styles.hero}>
                <header className={styles.header}>
                    <div className={styles.headerInner}>
                        <Link to="/" className={styles.brand}>
                            <i className="bi bi-palette-fill"></i> ArtVerse
                        </Link>
                        <nav className={`nav ${styles.nav}`}>
                            <NavLink to="/artworks" className={styles.navLink}>Browse Artworks</NavLink>
                            {!currentUser ? (
                                <>
                                    <NavLink to="/login" className={styles.navLink}>Login</NavLink>
                                    <NavLink to="/register" className={styles.navLink}>Register</NavLink>
                                </>
                            ) : (
                                <a href="/logout" className={styles.navLink} onClick={handleLogout}>Logout</a>
                            )}
                        </nav>
                    </div>
                </header>

                <main className={styles.heroContent}>
                    <span className={styles.kicker}>
                        <i className="bi bi-geo-alt-fill"></i> A marketplace for local Indian artists
                    </span>
                    <h1 className={styles.title}>ArtVerse</h1>
                    <p className={styles.lead}>
                        Discover unique artworks from artists near you.<br className={styles.leadBreak} />
                        Showcase your own creations, and rate and comment on others&rsquo; work.
                    </p>
                    <div className={styles.ctaRow}>
                        <Link to="/artworks" className={`btn btn-lg ${styles.ctaPrimary}`}>
                            <i className="bi bi-images"></i> Browse Artworks
                        </Link>
                        <Link to="/artworks/new" className={`btn btn-lg ${styles.ctaSecondary}`}>
                            <i className="bi bi-plus-lg"></i> Sell Your Artwork
                        </Link>
                    </div>
                    <div className={styles.categoryRow}>
                        {CATEGORIES.map(cat => (
                            <span key={cat} className={styles.categoryChip}>{cat}</span>
                        ))}
                    </div>
                </main>

                <div className={styles.scrollCue}>
                    <i className="bi bi-chevron-down"></i>
                </div>
            </div>

            <section className={styles.features}>
                <div className="container">
                    <div className="row g-4">
                        {FEATURES.map(f => (
                            <div className="col-md-4" key={f.title}>
                                <div className={styles.featureCard}>
                                    <div className={styles.featureIcon}>
                                        <i className={`bi ${f.icon}`}></i>
                                    </div>
                                    <h3 className={styles.featureTitle}>{f.title}</h3>
                                    <p className={styles.featureText}>{f.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
