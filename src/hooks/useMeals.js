// Custom hook for fetching meal data from localStorage
// Handles loading state and refetching when dates change
import { useState, useEffect, useCallback } from 'react';
import { getMealsByDateRange, indexMealsByDate } from '../lib/storage';

export function useMeals(startDate, endDate) {
  // meals: raw array from storage
  const [meals, setMeals] = useState([]);
  // mealsByDate: Map for quick lookup by date string
  const [mealsByDate, setMealsByDate] = useState(new Map());
  const [loading, setLoading] = useState(true);

  // Fetch function that can be called manually to refresh data
  const fetchMeals = useCallback(() => {
    if (!startDate || !endDate) return;
    setLoading(true);
    const data = getMealsByDateRange(startDate, endDate);
    setMeals(data);
    setMealsByDate(indexMealsByDate(data));
    setLoading(false);
  }, [startDate, endDate]);

  // Auto-fetch when date range changes
  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  return { meals, mealsByDate, loading, refetch: fetchMeals };
}
