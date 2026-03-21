// Weekly page - shows 7 days of meals in a vertical list
// Each day shows lunchbox and dinner side by side
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeals } from '../hooks/useMeals';
import { upsertMeal, deleteMeal } from '../lib/storage';
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

  // Open form to add/edit a meal
  function openForm(date, mealType, existingMeal = null) {
    setFormDate(date);
    setFormMealType(mealType);
    setFormInitialData(existingMeal);
    setFormOpen(true);
  }

  const handleSave = useCallback((mealData) => {
    upsertMeal(mealData);
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
            const lunchbox = dayMeals.find(m => m.meal_type === 'lunchbox');
            const dinner = dayMeals.find(m => m.meal_type === 'dinner');
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
                  {/* Lunchbox slot */}
                  <div
                    className={`weekly-meal-slot ${lunchbox ? 'has-meal' : ''}`}
                    onClick={() => openForm(dateStr, 'lunchbox', lunchbox)}
                  >
                    <span className="weekly-meal-type">🍱</span>
                    {lunchbox ? (
                      <div className="weekly-meal-info">
                        <span className="weekly-meal-name">{lunchbox.meal_name}</span>
                        <SourceTag source={lunchbox.source} size="small" />
                      </div>
                    ) : (
                      <span className="weekly-meal-empty">+</span>
                    )}
                  </div>

                  {/* Dinner slot */}
                  <div
                    className={`weekly-meal-slot ${dinner ? 'has-meal' : ''}`}
                    onClick={() => openForm(dateStr, 'dinner', dinner)}
                  >
                    <span className="weekly-meal-type">🍽️</span>
                    {dinner ? (
                      <div className="weekly-meal-info">
                        <span className="weekly-meal-name">{dinner.meal_name}</span>
                        <SourceTag source={dinner.source} size="small" />
                      </div>
                    ) : (
                      <span className="weekly-meal-empty">+</span>
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
