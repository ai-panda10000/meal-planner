// Local storage for meal plans
// Saves all meal data in the browser's localStorage
// Data is stored as a JSON object keyed by "date|meal_type"

const STORAGE_KEY = 'meal_plans';

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

// Fetch meals within a date range
// Filters the stored meals by date (inclusive)
export function getMealsByDateRange(startDate, endDate) {
  const meals = getAllMeals();
  return meals.filter(m => m.date >= startDate && m.date <= endDate);
}

// Insert or update a meal
// If a meal already exists for the same date + meal_type, it gets updated
export function upsertMeal({ date, meal_type, meal_name, source, source_note }) {
  const meals = getAllMeals();

  // Check if a meal already exists for this date and type
  const existingIndex = meals.findIndex(
    m => m.date === date && m.meal_type === meal_type
  );

  const mealData = {
    id: existingIndex >= 0 ? meals[existingIndex].id : generateId(),
    date,
    meal_type,
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
    // Add new meal
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
// Merges imported data with existing data (overwrites matching date+type)
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

        // Merge: imported meals overwrite existing ones with same date+type
        for (const meal of imported) {
          if (!meal.date || !meal.meal_type || !meal.meal_name) continue;

          const existingIndex = currentMeals.findIndex(
            m => m.date === meal.date && m.meal_type === meal.meal_type
          );

          const mealData = {
            id: meal.id || generateId(),
            date: meal.date,
            meal_type: meal.meal_type,
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
