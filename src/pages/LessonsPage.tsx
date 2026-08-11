import { Link } from 'react-router-dom';
import { LESSONS } from '../lessons';
import SiteHeader from '../components/SiteHeader';
import styles from './LessonsPage.module.css';

export default function LessonsPage() {
  return (
    <div className={styles.container}>
      <SiteHeader />

      <div className={styles.lessonList}>
        {LESSONS.map((lesson) => {
          const Preview = lesson.preview;
          return (
            <Link
              key={lesson.id}
              to={`/lessons/${lesson.id}`}
              className={styles.card}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardText}>
                  <h2 className={styles.cardTitle}>
                    {lesson.title}
                  </h2>
                  <p className={styles.cardDescription}>{lesson.description}</p>
                </div>
                {Preview && (
                  <div className={styles.cardPreview}>
                    <Preview />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
