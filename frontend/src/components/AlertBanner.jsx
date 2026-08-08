import { useAlert } from '../context/AlertContext';

export default function AlertBanner() {
    const { alerts, dismissAlert } = useAlert();

    if (!alerts.length) return null;

    return (
        <div
            className="position-fixed top-0 start-50 translate-middle-x d-flex flex-column"
            style={{ zIndex: 1080, top: '5rem', width: 'min(92vw, 420px)', gap: '0.5rem' }}
        >
            {alerts.map(alert => (
                <div key={alert.id} className={`alert alert-${alert.type} alert-dismissible fade show shadow-lg mb-0`} role="alert">
                    {alert.message}
                    <button className="btn-close" aria-label="close" onClick={() => dismissAlert(alert.id)}></button>
                </div>
            ))}
        </div>
    );
}
