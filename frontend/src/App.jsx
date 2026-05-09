import { Routes, Route, NavLink } from 'react-router-dom';
import BookingPage  from './pages/BookingPage';
import Dashboard    from './pages/Dashboard';
import styles from './App.module.css';

export default function App() {
  return (
    <div>
      <nav className={styles.nav}>
        <div className={styles.logo}>✂ رامي</div>
        <div className={styles.tabs}>
          <NavLink to="/"          className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>
            حجز موعد
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>
            داشبورد رامي
          </NavLink>
        </div>
      </nav>

      <main className={styles.main}>
        <Routes>
          <Route path="/"          element={<BookingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}
