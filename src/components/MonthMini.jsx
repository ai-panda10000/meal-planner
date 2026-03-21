// Mini month component for the yearly view
// Shows a compact calendar with colored dots on days that have meals
// Dot colors indicate the recipe source (blue=Nadia, pink=Instagram, gray=Free)
import { useNavigate } from 'react-router-dom';
import { getCalendarDays, MONTH_NAMES } from '../lib/dateUtils';
import './MonthMini.css';

export default function MonthMini({ year, month, mealsByDate }) {
  const navigate = useNavigate();

  // Generate calendar cells for this month
  const days = getCalendarDays(year, month);

  // Navigate to monthly view when the month header is tapped
  function handleClick() {
    const monthStr = String(month + 1).padStart(2, '0');
    navigate(`/monthly/${year}-${monthStr}`);
  }

  return (
    <div className="month-mini card" onClick={handleClick}>
      <h3 className="month-mini-title">{MONTH_NAMES[month]}</h3>
      <div className="month-mini-grid">
        {days.map(day => {
          const dayMeals = mealsByDate.get(day.dateStr) || [];
          const hasMeals = dayMeals.length > 0;

          // Get the primary source color for the dot
          // If there are multiple meals, use the first one's source
          const dotSource = hasMeals ? dayMeals[0].source : null;

          return (
            <div
              key={day.dateStr}
              className={`month-mini-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
            >
              <span className="month-mini-day">{day.date.getDate()}</span>
              {hasMeals && (
                <span className={`month-mini-dot dot-${dotSource}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
