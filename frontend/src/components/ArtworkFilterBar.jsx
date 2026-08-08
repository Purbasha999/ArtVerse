import styles from '../styles/artworkFilterBar.module.css';

export default function ArtworkFilterBar({ controls }) {
    const {
        sortBy, setSortBy,
        medium, setMedium,
        tag, setTag,
        location, setLocation,
        tagOptions, sortOptions, mediumOptions
    } = controls;

    return (
        <div className={`${styles.bar} mb-3`}>
            <div className={styles.group}>
                <span className={styles.label}><i className="bi bi-sort-down"></i> Sort by</span>
                <select
                    aria-label="Sort by"
                    className={`${styles.pill} form-select form-select-sm w-auto`}
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                >
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            <div className={styles.group}>
                <span className={styles.label}><i className="bi bi-funnel"></i> Filter</span>
                <select
                    aria-label="Filter by medium"
                    className={`${styles.pill} form-select form-select-sm w-auto`}
                    value={medium}
                    onChange={e => setMedium(e.target.value)}
                >
                    <option value="">All Mediums</option>
                    {mediumOptions.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select
                    aria-label="Filter by tag"
                    className={`${styles.pill} form-select form-select-sm w-auto`}
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                    disabled={tagOptions.length === 0}
                >
                    <option value="">All Tags</option>
                    {tagOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                    aria-label="Filter by location"
                    type="text"
                    className={`${styles.pill} form-control form-control-sm`}
                    placeholder="City or state"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                />
            </div>
        </div>
    );
}
