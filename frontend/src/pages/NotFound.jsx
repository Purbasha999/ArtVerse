import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="row">
            <div className="col-md-6 offset-md-3">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Page Not Found</h4>
                    <p>The page you're looking for doesn't exist.</p>
                    <Link to="/artworks" className="btn btn-primary mt-2">Back to Artworks</Link>
                </div>
            </div>
        </div>
    );
}
