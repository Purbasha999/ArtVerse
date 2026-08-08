import { useEffect } from 'react';

// A React-controlled Bootstrap-styled modal (no data-bs-* JS plugin wiring -
// just Bootstrap's CSS classes shown/hidden directly from state).
export default function Modal({ title, onClose, children }) {
    useEffect(() => {
        const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <>
            <div className="modal d-block" tabIndex="-1" role="dialog" onClick={onClose}>
                <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered" role="document" onClick={e => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">{children}</div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop show"></div>
        </>
    );
}
