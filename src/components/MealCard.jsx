// Meal card component
// Displays a single meal entry with its name, source tag, and notes
// Used in DailyPage and WeeklyPage to show planned meals
import SourceTag from './SourceTag';
import './MealCard.css';

export default function MealCard({ meal, onEdit, onDelete }) {
  return (
    <div className="meal-card card" onClick={() => onEdit(meal)}>
      {/* Top row: meal name and source badge */}
      <div className="meal-card-header">
        <span className="meal-card-name">{meal.meal_name}</span>
        <SourceTag source={meal.source} />
      </div>

      {/* Show recipe notes if source is "free" and notes exist */}
      {meal.source === 'free' && meal.source_note && (
        <p className="meal-card-note">{meal.source_note}</p>
      )}

      {/* Delete button - stops click from triggering edit */}
      <button
        className="meal-card-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(meal);
        }}
        aria-label="Delete meal"
      >
        ×
      </button>
    </div>
  );
}
