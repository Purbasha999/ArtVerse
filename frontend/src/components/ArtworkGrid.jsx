import styles from '../styles/artworkGrid.module.css';

export default function ArtworkGrid({ children }) {
    return <div className={styles.grid}>{children}</div>;
}
