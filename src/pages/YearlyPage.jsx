// Yearly page - shows all 12 months as mini calendars
// Each month shows colored dots on days with planned meals
// Tapping a month navigates to the monthly view
import { useParams, useNavigate } from 'react-router-dom';
import { useMeals } from '../hooks/useMeals';
import { getYearRange } from '../lib/dateUtils';
import MonthMini from '../components/MonthMini';
import './YearlyPage.css';

export default function YearlyPage() {
  const { year: yearParam } = useParams();
  const navigate = useNavigate();

  // Use URL year parameter or current year
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  // Fetch all meals for the entire year in a single query
  const { start, end } = getYearRange(year);
  const { mealsByDate, loading } = useMeals(start, end);

  // Navigate to previous or next year
  function goToYear(offset) {
    navigate(`/yearly/${year + offset}`);
  }

  return (
    <div className="page">
      {/* Year navigation header */}
      <div className="yearly-header">
        <button className="nav-arrow" onClick={() => goToYear(-1)}>‹</button>
        <h1 className="yearly-title">{year}</h1>
        <button className="nav-arrow" onClick={() => goToYear(1)}>›</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="yearly-grid">
          {/* Render all 12 months */}
          {Array.from({ length: 12 }, (_, i) => (
            <MonthMini
              key={i}
              year={year}
              month={i}
              mealsByDate={mealsByDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
