// Local storage for meal plans
// Saves all meal data in the browser's localStorage
// Each meal is a separate record with a unique ID

const STORAGE_KEY = 'meal_plans';

// 📝 Dish categories for each meal type
// Lunchbox has Main and Side, Dinner has Main, Side, Soup, and Salad
// Both have "Other" for custom categories the user can name themselves
export const DISH_CATEGORIES = {
  lunchbox: [
    { value: 'main', label: 'Main' },
    { value: 'side', label: 'Side' },
    { value: 'other', label: 'Other' },
  ],
  dinner: [
    { value: 'main', label: 'Main' },
    { value: 'side', label: 'Side' },
    { value: 'soup', label: 'Soup' },
    { value: 'salad', label: 'Salad' },
    { value: 'other', label: 'Other' },
  ],
};

// 📝 Priority order for sorting dishes within a meal type
// Main dishes appear first, then sides, then soup/salad, then custom
const CATEGORY_ORDER = ['main', 'side', 'soup', 'salad'];

// Sort dishes by category priority, then by creation date
export function sortDishesByCategory(dishes) {
  return [...dishes].sort((a, b) => {
    const orderA = CATEGORY_ORDER.indexOf(a.dish_category);
    const orderB = CATEGORY_ORDER.indexOf(b.dish_category);
    // If category is not in the list (custom), put it at the end
    const priorityA = orderA >= 0 ? orderA : CATEGORY_ORDER.length;
    const priorityB = orderB >= 0 ? orderB : CATEGORY_ORDER.length;
    if (priorityA !== priorityB) return priorityA - priorityB;
    // Same priority → sort by creation time
    return (a.created_at || '').localeCompare(b.created_at || '');
  });
}

// 📝 Get a display label for a dish_category value
// For known categories (main, side, soup, salad) returns the capitalized name
// For custom categories, returns the custom text as-is
export function getCategoryLabel(category) {
  if (!category) return 'Main';
  const known = { main: 'Main', side: 'Side', soup: 'Soup', salad: 'Salad' };
  return known[category] || category;
}

// Read all meals from localStorage
function getAllMeals() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save all meals to localStorage
function saveAllMeals(meals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
}

// Generate a unique ID for each meal
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// 📝 Migration function: adds dish_category to existing meals that don't have it
// This runs once on app startup so old data works with the new multi-dish feature
export function migrateMeals() {
  const meals = getAllMeals();
  let changed = false;
  for (const meal of meals) {
    if (!meal.dish_category) {
      // Default existing meals to "main" category
      meal.dish_category = 'main';
      changed = true;
    }
  }
  if (changed) {
    saveAllMeals(meals);
  }
}

// Fetch meals within a date range
// Filters the stored meals by date (inclusive)
export function getMealsByDateRange(startDate, endDate) {
  const meals = getAllMeals();
  return meals.filter(m => m.date >= startDate && m.date <= endDate);
}

// 📝 Save a meal (add new or update existing)
// NEW behavior: uses the meal's "id" to find existing records
// This allows multiple dishes per date + meal_type (e.g. main dish AND side dish)
// Old behavior used date+meal_type as unique key, which only allowed one meal per slot
export function saveMeal({ id, date, meal_type, dish_category, meal_name, source, source_note }) {
  const meals = getAllMeals();

  // If an id is provided, look for an existing meal to update
  const existingIndex = id ? meals.findIndex(m => m.id === id) : -1;

  const mealData = {
    id: existingIndex >= 0 ? meals[existingIndex].id : generateId(),
    date,
    meal_type,
    dish_category: dish_category || 'main',
    meal_name,
    source,
    source_note: source_note || '',
    created_at: existingIndex >= 0 ? meals[existingIndex].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    // Update existing meal
    meals[existingIndex] = mealData;
  } else {
    // Add as a new meal
    meals.push(mealData);
  }

  saveAllMeals(meals);
  return mealData;
}

// Delete a meal by its ID
export function deleteMeal(id) {
  const meals = getAllMeals();
  const filtered = meals.filter(m => m.id !== id);
  saveAllMeals(filtered);
}

// Convert an array of meals into a Map keyed by date string
// This allows O(1) lookup when rendering calendar cells
export function indexMealsByDate(meals) {
  const map = new Map();
  for (const meal of meals) {
    if (!map.has(meal.date)) {
      map.set(meal.date, []);
    }
    map.get(meal.date).push(meal);
  }
  return map;
}

// Export all meals as a JSON file download
export function exportToJson() {
  const meals = getAllMeals();
  const json = JSON.stringify(meals, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create a temporary link and click it to trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `meal-plans-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();

  // Clean up the temporary URL
  URL.revokeObjectURL(url);
}

// Import meals from a JSON file
// 📝 NEW: matches by id instead of date+meal_type
// This supports multiple dishes per date+meal_type
export function importFromJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // Validate that the data is an array of meal objects
        if (!Array.isArray(imported)) {
          reject(new Error('Invalid file format: expected an array of meals'));
          return;
        }

        const currentMeals = getAllMeals();

        // Merge: imported meals overwrite existing ones with same id
        for (const meal of imported) {
          if (!meal.date || !meal.meal_type || !meal.meal_name) continue;

          // Match by id if available, otherwise add as new
          const existingIndex = meal.id
            ? currentMeals.findIndex(m => m.id === meal.id)
            : -1;

          const mealData = {
            id: meal.id || generateId(),
            date: meal.date,
            meal_type: meal.meal_type,
            dish_category: meal.dish_category || 'main',
            meal_name: meal.meal_name,
            source: meal.source || 'free',
            source_note: meal.source_note || '',
            created_at: meal.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          if (existingIndex >= 0) {
            currentMeals[existingIndex] = mealData;
          } else {
            currentMeals.push(mealData);
          }
        }

        saveAllMeals(currentMeals);
        resolve(currentMeals.length);
      } catch (err) {
        reject(new Error('Failed to parse JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
