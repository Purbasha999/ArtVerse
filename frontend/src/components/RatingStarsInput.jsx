import { Fragment } from 'react';

const TITLES = { 1: 'Terrible', 2: 'Not good', 3: 'Average', 4: 'Very good', 5: 'Amazing' };

export default function RatingStarsInput({ value, onChange, name = 'rating' }) {
    return (
        <fieldset className="starability-slot">
            <input type="radio" id="no-rate" className="input-no-rate" name={name} value="0" defaultChecked aria-label="No rating." />
            {[1, 2, 3, 4, 5].map(n => (
                <Fragment key={n}>
                    <input
                        type="radio"
                        id={`rate-${n}`}
                        name={name}
                        value={n}
                        checked={value === n}
                        onChange={() => onChange(n)}
                    />
                    <label htmlFor={`rate-${n}`} title={TITLES[n]}>{n} star{n > 1 ? 's' : ''}</label>
                </Fragment>
            ))}
        </fieldset>
    );
}
