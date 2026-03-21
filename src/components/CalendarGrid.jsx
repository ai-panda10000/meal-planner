// Calendar grid component for the monthly view
// Renders a traditional month calendar with meal info in each cell
import { useNavigate } from 'react-router-dom';
import { getCalendarDays, DAY_NAMES } from '../lib/dateUtils';
import SourceTag from './SourceTag';
import './CalendarGrid.css';

export default function CalendarGrid({ year, month, mealsByDate }) {
  const navigate = useNavigate();

  // Generate all calendar cells for this month
  // Includes padding days from previous/next month to fill complete weeks
  const days = getCalendarDays(year, month);

  // Navigate to the daily view when a day is tapped
  function handleDayClick(dateStr) {
    navigate(`/day/${dateStr}`);
  }

  return (
    <div className="calendar-grid">
      {/* Day name headers (Mon, Tue, ..., Sun) */}
      <div className="calendar-header">
        {DAY_NAMES.map(name => (
          <div key={name} className="calendar-header-cell">{name}</div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="calendar-body">
        {days.map(day => {
          const dayMeals = mealsByDate.get(day.dateStr) || [];
          const lunchbox = dayMeals.find(m => m.meal_type === 'lunchbox');
          const dinner = dayMeals.find(m => m.meal_type === 'dinner');

          return (
            <div
              key={day.dateStr}
              className={`calendar-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
              onClick={() => handleDayClick(day.dateStr)}
            >
              <span className="calendar-day-number">{day.date.getDate()}</span>

              {/* Show meal names if any exist */}
              <div className="calendar-meals">
                {lunchbox && (
                  <div className="calendar-meal">
                    <span className="calendar-meal-name">{lunchbox.meal_name}</span>
                    <SourceTag source={lunchbox.source} size="small" />
                  </div>
                )}
                {dinner && (
                  <div className="calendar-meal">
                    <span className="calendar-meal-name">{dinner.meal_name}</span>
                    <SourceTag source={dinner.source} size="small" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
