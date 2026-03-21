// Calendar grid component for the monthly view
// Renders a traditional month calendar with meal info in each cell
// 📝 Now shows multiple dishes per day with a "+N" count when there are extras
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
          // 📝 Get all dishes for each meal type
          const lunchboxMeals = dayMeals.filter(m => m.meal_type === 'lunchbox');
          const dinnerMeals = dayMeals.filter(m => m.meal_type === 'dinner');

          return (
            <div
              key={day.dateStr}
              className={`calendar-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
              onClick={() => handleDayClick(day.dateStr)}
            >
              <span className="calendar-day-number">{day.date.getDate()}</span>

              {/* Show meal names if any exist */}
              <div className="calendar-meals">
                {/* 📝 Show first lunchbox dish name + count of extras */}
                {lunchboxMeals.length > 0 && (
                  <div className="calendar-meal">
                    <span className="calendar-meal-name">
                      {lunchboxMeals[0].meal_name}
                      {lunchboxMeals.length > 1 && (
                        <span className="calendar-meal-count"> +{lunchboxMeals.length - 1}</span>
                      )}
                    </span>
                    <SourceTag source={lunchboxMeals[0].source} size="small" />
                  </div>
                )}
                {/* 📝 Show first dinner dish name + count of extras */}
                {dinnerMeals.length > 0 && (
                  <div className="calendar-meal">
                    <span className="calendar-meal-name">
                      {dinnerMeals[0].meal_name}
                      {dinnerMeals.length > 1 && (
                        <span className="calendar-meal-count"> +{dinnerMeals.length - 1}</span>
                      )}
                    </span>
                    <SourceTag source={dinnerMeals[0].source} size="small" />
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
