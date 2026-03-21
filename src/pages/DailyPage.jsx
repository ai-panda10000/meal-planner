// Daily page - the main/home page
// Shows lunchbox and dinner meals for a single day
// Users can add, edit, and delete meals from this view
// 📝 Now supports multiple dishes per lunchbox/dinner (e.g. main + side + soup)
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeals } from '../hooks/useMeals';
import { saveMeal, deleteMeal, sortDishesByCategory } from '../lib/storage';
import { formatDate, formatDisplayDate, parseDate, addDays, today } from '../lib/dateUtils';
import MealCard from '../components/MealCard';
import MealForm from '../components/MealForm';
import EmptyState from '../components/EmptyState';
import './DailyPage.css';

export default function DailyPage() {
  const { date: dateParam } = useParams();
  const navigate = useNavigate();

  // Use URL date parameter or default to today
  const currentDate = dateParam || today();
  const dateObj = parseDate(currentDate);

  // Fetch meals for this single day
  const { meals, loading, refetch } = useMeals(currentDate, currentDate);

  // Modal state for adding/editing meals
  const [formOpen, setFormOpen] = useState(false);
  const [formMealType, setFormMealType] = useState('lunchbox');
  const [formInitialData, setFormInitialData] = useState(null);

  // Confirm delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 📝 Find ALL meals for each type (not just one)
  // .filter() returns an array of all matching meals
  // sortDishesByCategory puts them in order: Main → Side → Soup → Salad → Other
  const lunchboxMeals = sortDishesByCategory(meals.filter(m => m.meal_type === 'lunchbox'));
  const dinnerMeals = sortDishesByCategory(meals.filter(m => m.meal_type === 'dinner'));

  // Navigate to previous or next day
  function goToDay(offset) {
    const newDate = addDays(dateObj, offset);
    navigate(`/day/${formatDate(newDate)}`);
  }

  // Navigate back to today
  function goToToday() {
    navigate('/');
  }

  // Open the add/edit form
  function openForm(mealType, existingMeal = null) {
    setFormMealType(mealType);
    setFormInitialData(existingMeal);
    setFormOpen(true);
  }

  // Save meal handler - called by the MealForm component
  // 📝 Now uses saveMeal instead of upsertMeal
  // saveMeal creates a new record if no id, or updates if id exists
  const handleSave = useCallback((mealData) => {
    saveMeal(mealData);
    refetch();
  }, [refetch]);

  // Delete meal handler
  function handleDelete() {
    if (!deleteTarget) return;
    deleteMeal(deleteTarget.id);
    refetch();
    setDeleteTarget(null);
  }

  const isToday = currentDate === today();

  return (
    <div className="page">
      {/* Date navigation header */}
      <div className="daily-header">
        <button className="nav-arrow" onClick={() => goToDay(-1)}>‹</button>
        <div className="daily-date-info">
          <h1 className="daily-date">{formatDisplayDate(dateObj)}</h1>
          {!isToday && (
            <button className="today-btn" onClick={goToToday}>Today</button>
          )}
        </div>
        <button className="nav-arrow" onClick={() => goToDay(1)}>›</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="daily-meals">
          {/* Lunchbox section */}
          <section className="meal-section">
            <h2 className="meal-section-title">
              <span className="meal-section-icon">🍱</span> Lunchbox
            </h2>
            {/* 📝 Show ALL lunchbox dishes as a list of cards */}
            {lunchboxMeals.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
                onEdit={() => openForm('lunchbox', meal)}
                onDelete={() => setDeleteTarget(meal)}
              />
            ))}
            {/* 📝 Always show the Add button so users can add more dishes */}
            <button
              className="add-meal-btn card"
              onClick={() => openForm('lunchbox')}
            >
              + Add Lunchbox
            </button>
          </section>

          {/* Dinner section */}
          <section className="meal-section">
            <h2 className="meal-section-title">
              <span className="meal-section-icon">🍽️</span> Dinner
            </h2>
            {/* 📝 Show ALL dinner dishes as a list of cards */}
            {dinnerMeals.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
                onEdit={() => openForm('dinner', meal)}
                onDelete={() => setDeleteTarget(meal)}
              />
            ))}
            {/* 📝 Always show the Add button so users can add more dishes */}
            <button
              className="add-meal-btn card"
              onClick={() => openForm('dinner')}
            >
              + Add Dinner
            </button>
          </section>

          {/* Show empty state only when no meals at all */}
          {lunchboxMeals.length === 0 && dinnerMeals.length === 0 && (
            <EmptyState
              title="No meals planned"
              message="Tap the + buttons above to plan your meals"
            />
          )}
        </div>
      )}

      {/* Add/Edit meal modal */}
      {formOpen && (
        <MealForm
          date={currentDate}
          mealType={formMealType}
          initialData={formInitialData}
          onSave={handleSave}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="confirm-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3>Delete Meal?</h3>
            <p>Are you sure you want to delete "{deleteTarget.meal_name}"?</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
