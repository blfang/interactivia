import styles from './Footer.module.css';

export default function Footer() {
  return (
    <p className={styles.footer}>
      <a
        href="https://github.com/blfang/interactivia/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        Created by blfang
      </a>
    </p>
  );
}
