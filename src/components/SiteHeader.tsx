import { Link } from 'react-router-dom';
import styles from './SiteHeader.module.css';

export default function SiteHeader() {
  return (
    <>
      <h1 className={styles.title}>
        <Link to="/" className={styles.titleLink}>
          Interactivia
        </Link>
      </h1>
      <p className={styles.subtitle}>
        Interactive activities for math intuition
      </p>
    </>
  );
}
