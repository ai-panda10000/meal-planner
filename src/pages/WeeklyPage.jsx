// Weekly page - shows 7 days of meals in a vertical list
// Each day shows lunchbox and dinner side by side
// 📝 Now shows multiple dishes per meal type
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeals } from '../hooks/useMeals';
import { saveMeal, deleteMeal, sortDishesByCategory } from '../lib/storage';
import {
  parseDate, formatDate, formatShortDate, getWeekStart,
  getWeekRange, getWeekDays, addDays, today, DAY_NAMES
} from '../lib/dateUtils';
import SourceTag from '../components/SourceTag';
import MealForm from '../components/MealForm';
import './WeeklyPage.css';

export default function WeeklyPage() {
  const { date: dateParam } = useParams();
  const navigate = useNavigate();

  // Calculate the week based on URL param or today
  const baseDate = dateParam ? parseDate(dateParam) : new Date();
  const weekStart = getWeekStart(baseDate);
  const { start, end } = getWeekRange(baseDate);

  // Fetch all meals for this week in one query
  const { mealsByDate, loading, refetch } = useMeals(start, end);

  // Get the 7 days of the week
  const weekDays = getWeekDays(weekStart);

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formMealType, setFormMealType] = useState('lunchbox');
  const [formInitialData, setFormInitialData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Navigate to previous or next week
  function goToWeek(offset) {
    const newDate = addDays(weekStart, offset * 7);
    navigate(`/weekly/${formatDate(newDate)}`);
  }

  // Open form to add a new meal for a specific date and type
  function openAddForm(date, mealType) {
    setFormDate(date);
    setFormMealType(mealType);
    setFormInitialData(null);
    setFormOpen(true);
  }

  const handleSave = useCallback((mealData) => {
    saveMeal(mealData);
    refetch();
  }, [refetch]);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMeal(deleteTarget.id);
    refetch();
    setDeleteTarget(null);
  }

  // Header showing the week range
  const headerText = `${formatShortDate(weekStart)} - ${formatShortDate(addDays(weekStart, 6))}`;

  return (
    <div className="page">
      {/* Week navigation header */}
      <div className="weekly-header">
        <button className="nav-arrow" onClick={() => goToWeek(-1)}>‹</button>
        <h1 className="weekly-title">{headerText}</h1>
        <button className="nav-arrow" onClick={() => goToWeek(1)}>›</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="weekly-grid">
          {weekDays.map((dayDate, index) => {
            const dateStr = formatDate(dayDate);
            const dayMeals = mealsByDate.get(dateStr) || [];
            // 📝 Get all dishes for each type (not just one)
            const lunchboxMeals = sortDishesByCategory(dayMeals.filter(m => m.meal_type === 'lunchbox'));
            const dinnerMeals = sortDishesByCategory(dayMeals.filter(m => m.meal_type === 'dinner'));
            const isToday = dateStr === today();

            return (
              <div key={dateStr} className={`weekly-day card ${isToday ? 'weekly-day-today' : ''}`}>
                {/* Day header */}
                <div className="weekly-day-header">
                  <span className="weekly-day-name">{DAY_NAMES[index]}</span>
                  <span className="weekly-day-date">{dayDate.getDate()}</span>
                </div>

                {/* Two meal slots side by side */}
                <div className="weekly-day-meals">
                  {/* 📝 Lunchbox slot - click navigates to daily page for full editing */}
                  <div
                    className={`weekly-meal-slot ${lunchboxMeals.length > 0 ? 'has-meal' : ''}`}
                    onClick={() => navigate(`/day/${dateStr}`)}
                  >
                    <span className="weekly-meal-type">🍱</span>
                    {lunchboxMeals.length > 0 ? (
                      <div className="weekly-meal-info">
                        {/* Show all dish names in a compact list */}
                        {lunchboxMeals.map(m => (
                          <span key={m.id} className="weekly-meal-name">{m.meal_name}</span>
                        ))}
                      </div>
                    ) : (
                      <span
                        className="weekly-meal-empty"
                        onClick={(e) => { e.stopPropagation(); openAddForm(dateStr, 'lunchbox'); }}
                      >+</span>
                    )}
                  </div>

                  {/* 📝 Dinner slot - click navigates to daily page for full editing */}
                  <div
                    className={`weekly-meal-slot ${dinnerMeals.length > 0 ? 'has-meal' : ''}`}
                    onClick={() => navigate(`/day/${dateStr}`)}
                  >
                    <span className="weekly-meal-type">🍽️</span>
                    {dinnerMeals.length > 0 ? (
                      <div className="weekly-meal-info">
                        {dinnerMeals.map(m => (
                          <span key={m.id} className="weekly-meal-name">{m.meal_name}</span>
                        ))}
                      </div>
                    ) : (
                      <span
                        className="weekly-meal-empty"
                        onClick={(e) => { e.stopPropagation(); openAddForm(dateStr, 'dinner'); }}
                      >+</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      {formOpen && (
        <MealForm
          date={formDate}
          mealType={formMealType}
          initialData={formInitialData}
          onSave={handleSave}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="confirm-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3>Delete Meal?</h3>
            <p>Delete "{deleteTarget.meal_name}"?</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
