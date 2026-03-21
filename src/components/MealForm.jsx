// Meal form modal component
// Used to add a new meal or edit an existing one
// Shows as a bottom sheet that slides up from the bottom of the screen
import { useState, useEffect } from 'react';
import { DISH_CATEGORIES } from '../lib/storage';
import './MealForm.css';

// The three source options with their display labels
const SOURCE_OPTIONS = [
  { value: 'nadia', label: 'Nadia' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'free', label: 'Free' },
];

// 📝 Check if a dish_category value is a known/fixed category
// Known categories are: main, side, soup, salad
// Anything else is a custom "Other" category the user typed in
function isKnownCategory(value) {
  return ['main', 'side', 'soup', 'salad'].includes(value);
}

export default function MealForm({ date, mealType, initialData, onSave, onClose }) {
  // Form state - pre-fill if editing an existing meal
  const [mealName, setMealName] = useState(initialData?.meal_name || '');
  const [source, setSource] = useState(initialData?.source || 'free');
  const [sourceNote, setSourceNote] = useState(initialData?.source_note || '');
  const [saving, setSaving] = useState(false);

  // 📝 Dish category state
  // If editing an existing meal with a custom category, set the selector to "other"
  // and store the custom text separately
  const initialCategory = initialData?.dish_category || 'main';
  const initialIsCustom = initialCategory && !isKnownCategory(initialCategory);
  const [dishCategory, setDishCategory] = useState(initialIsCustom ? 'other' : initialCategory);
  const [customCategory, setCustomCategory] = useState(initialIsCustom ? initialCategory : '');

  // 📝 Get the list of categories for this meal type (lunchbox vs dinner)
  const categoryOptions = DISH_CATEGORIES[mealType] || DISH_CATEGORIES.dinner;

  // Reset form when initialData changes (switching between add/edit)
  useEffect(() => {
    setMealName(initialData?.meal_name || '');
    setSource(initialData?.source || 'free');
    setSourceNote(initialData?.source_note || '');

    const cat = initialData?.dish_category || 'main';
    const isCustom = cat && !isKnownCategory(cat);
    setDishCategory(isCustom ? 'other' : cat);
    setCustomCategory(isCustom ? cat : '');
  }, [initialData]);

  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault();
    if (!mealName.trim()) return;

    // 📝 Determine the final dish_category value to save
    // If "Other" is selected, use the custom text (or fallback to "other")
    const finalCategory = dishCategory === 'other'
      ? (customCategory.trim() || 'other')
      : dishCategory;

    onSave({
      // 📝 Pass the id so storage knows whether to update or create
      id: initialData?.id,
      date,
      meal_type: mealType,
      dish_category: finalCategory,
      meal_name: mealName.trim(),
      source,
      source_note: source === 'free' ? sourceNote.trim() : '',
    });
    onClose();
  }

  // Display label for the meal type
  const mealTypeLabel = mealType === 'lunchbox' ? 'Lunchbox' : 'Dinner';

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop clicks inside the modal from closing it */}
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? 'Edit' : 'Add'} {mealTypeLabel}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="meal-form">
          {/* 📝 Dish category selector - shows different options for lunchbox vs dinner */}
          <div className="form-group">
            <label className="label">Dish Category</label>
            <div className="category-selector">
              {categoryOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`category-btn ${dishCategory === opt.value ? 'active' : ''}`}
                  onClick={() => setDishCategory(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 📝 Custom category text input - only shown when "Other" is selected */}
          {dishCategory === 'other' && (
            <div className="form-group">
              <label className="label">Custom Category Name</label>
              <input
                type="text"
                className="input"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="e.g. Dessert, Fruit, Rice..."
              />
            </div>
          )}

          {/* Meal name input */}
          <div className="form-group">
            <label className="label">Meal Name</label>
            <input
              type="text"
              className="input"
              value={mealName}
              onChange={e => setMealName(e.target.value)}
              placeholder="e.g. 鶏の唐揚げ弁当"
              autoFocus
              required
            />
          </div>

          {/* Source selector - 3 toggle buttons */}
          <div className="form-group">
            <label className="label">Recipe Source</label>
            <div className="source-selector">
              {SOURCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`source-btn source-btn-${opt.value} ${source === opt.value ? 'active' : ''}`}
                  onClick={() => setSource(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipe notes - only shown when "Free" is selected */}
          {source === 'free' && (
            <div className="form-group">
              <label className="label">Recipe Notes</label>
              <textarea
                className="textarea"
                value={sourceNote}
                onChange={e => setSourceNote(e.target.value)}
                placeholder="Write your recipe or notes here..."
                rows={3}
              />
            </div>
          )}

          {/* Save button */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={saving || !mealName.trim()}
          >
            {saving ? 'Saving...' : 'Save Meal'}
          </button>
        </form>
      </div>
    </div>
  );
}
