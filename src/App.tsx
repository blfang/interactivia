import { Routes, Route, Navigate, useParams, Link } from 'react-router-dom';
import LessonsPage from './pages/LessonsPage';
import LessonPage from './pages/LessonPage';
import { getLessonById } from './lessons';

function LessonPageRoute() {
  const { lessonId } = useParams();
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return (
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '2rem 1rem',
          textAlign: 'center',
        }}
      >
        <h1>Lesson not found</h1>
        <p>
          <Link to="/">Back to all lessons</Link>
        </p>
      </div>
    );
  }

  return <LessonPage steps={lesson.steps} title={lesson.title} stepTitles={lesson.stepTitles} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LessonsPage />} />
      <Route path="/lessons/:lessonId" element={<LessonPageRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
