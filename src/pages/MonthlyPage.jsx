// Monthly page - traditional calendar grid view
// Shows the entire month with meal names and source tags in each day cell
// Tapping a day navigates to the daily view
import { useParams, useNavigate } from 'react-router-dom';
import { useMeals } from '../hooks/useMeals';
import { getMonthRange, MONTH_NAMES } from '../lib/dateUtils';
import CalendarGrid from '../components/CalendarGrid';
import './MonthlyPage.css';

export default function MonthlyPage() {
  const { yearMonth } = useParams();
  const navigate = useNavigate();

  // Parse year and month from URL or use current date
  let year, month;
  if (yearMonth) {
    const [y, m] = yearMonth.split('-').map(Number);
    year = y;
    month = m - 1; // JS months are 0-indexed
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  // Fetch all meals for this month
  const { start, end } = getMonthRange(year, month);
  const { mealsByDate, loading } = useMeals(start, end);

  // Navigate to previous or next month
  function goToMonth(offset) {
    let newMonth = month + offset;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    const monthStr = String(newMonth + 1).padStart(2, '0');
    navigate(`/monthly/${newYear}-${monthStr}`);
  }

  const headerText = `${MONTH_NAMES[month]} ${year}`;

  return (
    <div className="page">
      {/* Month navigation header */}
      <div className="monthly-header">
        <button className="nav-arrow" onClick={() => goToMonth(-1)}>‹</button>
        <h1 className="monthly-title">{headerText}</h1>
        <button className="nav-arrow" onClick={() => goToMonth(1)}>›</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <CalendarGrid year={year} month={month} mealsByDate={mealsByDate} />
      )}
    </div>
  );
}
