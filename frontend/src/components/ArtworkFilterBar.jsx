export default function ArtworkFilterBar({ controls }) {
    const {
        sortBy, setSortBy,
        medium, setMedium,
        tag, setTag,
        location, setLocation,
        tagOptions, sortOptions, mediumOptions
    } = controls;

    return (
        <div className="row g-2 align-items-end mb-3">
            <div className="col-sm-6 col-lg-3">
                <label className="form-label small mb-1" htmlFor="sortBy">Sort by</label>
                <select id="sortBy" className="form-select form-select-sm" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
            <div className="col-sm-6 col-lg-3">
                <label className="form-label small mb-1" htmlFor="filterMedium">Medium</label>
                <select id="filterMedium" className="form-select form-select-sm" value={medium} onChange={e => setMedium(e.target.value)}>
                    <option value="">All Mediums</option>
                    {mediumOptions.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div className="col-sm-6 col-lg-3">
                <label className="form-label small mb-1" htmlFor="filterTag">Tag</label>
                <select
                    id="filterTag"
                    className="form-select form-select-sm"
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                    disabled={tagOptions.length === 0}
                >
                    <option value="">All Tags</option>
                    {tagOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div className="col-sm-6 col-lg-3">
                <label className="form-label small mb-1" htmlFor="filterLocation">Location</label>
                <input
                    id="filterLocation"
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="City or state"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                />
            </div>
        </div>
    );
}
